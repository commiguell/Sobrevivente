/**
 * Transfer.me Booking — comportamento do browser.
 * Sem dependências. Toda a lógica de preço e de Google fica no servidor.
 */
(function () {
	'use strict';

	const cfg = window.tmbConfig || {};
	const t = cfg.i18n || {};

	function api(path, body, method) {
		const headers = { 'Content-Type': 'application/json' };
		if (cfg.nonce) {
			headers['X-WP-Nonce'] = cfg.nonce;
		}
		const opts = { method: method || 'POST', credentials: 'same-origin', headers: headers };
		if (body !== undefined) {
			opts.body = JSON.stringify(body);
		}
		return fetch(cfg.root + path, opts)
			.then(function (r) {
				return r.json().catch(function () { return {}; }).then(function (data) {
					return { ok: r.ok, status: r.status, data: data };
				});
			})
			.catch(function () {
				return { ok: false, status: 0, data: {} };
			});
	}

	function debounce(fn, ms) {
		let timer;
		return function () {
			clearTimeout(timer);
			const args = arguments;
			timer = setTimeout(function () { fn.apply(null, args); }, ms);
		};
	}

	/**
	 * Token de sessão para a Places API (New): no máximo 36 caracteres, base64 seguro para URL.
	 * Um UUID v4 cumpre isso; a alternativa gera 32 caracteres hexadecimais.
	 */
	function sessionToken() {
		if (window.crypto && crypto.randomUUID) {
			return crypto.randomUUID();
		}
		const bytes = new Uint8Array(16);
		if (window.crypto && crypto.getRandomValues) {
			crypto.getRandomValues(bytes);
		} else {
			for (let i = 0; i < bytes.length; i++) { bytes[i] = Math.floor(Math.random() * 256); }
		}
		return Array.prototype.map.call(bytes, function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
	}

	function text(tag, className, content) {
		const node = document.createElement(tag);
		if (className) { node.className = className; }
		node.textContent = content;
		return node;
	}

	/* ----------------------------------------------------------------
	 * Formulário do cliente
	 * ---------------------------------------------------------------- */
	const form = document.getElementById('tmb-form');
	if (form) {
		initCustomer(form);
	}

	function initCustomer(form) {
		const state = {
			quoteId: '',
			canSubmit: false,
			pending: false,
			expiry: null,
			session: { pickup: sessionToken(), dropoff: sessionToken() },
		};

		const fields = {
			pickup: { text: 'tmb-pickup-text', list: 'tmb-pickup-list', place: 'tmb-pickup-place', lat: 'tmb-pickup-lat', lng: 'tmb-pickup-lng' },
			dropoff: { text: 'tmb-dropoff-text', list: 'tmb-dropoff-list', place: 'tmb-dropoff-place' },
		};
		// Token da sessão que originou cada place_id: é enviado com a cotação para fechar a sessão.
		const placeSession = { pickup: '', dropoff: '' };

		function el(id) { return document.getElementById(id); }

		function invalidate() {
			state.canSubmit = false;
			state.quoteId = '';
			clearTimeout(state.expiry);
			updateSubmit();
		}

		function setPoint(kind, point) {
			const f = fields[kind];
			el(f.place).value = point.place_id || '';
			if (f.lat) { el(f.lat).value = point.lat || ''; el(f.lng).value = point.lng || ''; }
			invalidate();
			scheduleQuote();
		}

		function clearPoint(kind) {
			const f = fields[kind];
			el(f.place).value = '';
			placeSession[kind] = '';
			if (f.lat) { el(f.lat).value = ''; el(f.lng).value = ''; }
		}

		function renderSuggestions(kind, items) {
			const f = fields[kind];
			const list = el(f.list);
			list.innerHTML = '';
			if (!items.length) {
				list.hidden = true;
				el(f.text).setAttribute('aria-expanded', 'false');
				return;
			}
			items.forEach(function (s) {
				const li = text('li', '', s.text);
				li.setAttribute('role', 'option');
				li.tabIndex = -1;
				li.addEventListener('mousedown', function (e) {
					e.preventDefault();
					el(f.text).value = s.text;
					placeSession[kind] = state.session[kind];
					state.session[kind] = sessionToken(); // A próxima pesquisa é uma nova sessão.
					setPoint(kind, { place_id: s.place_id });
					list.hidden = true;
					el(f.text).setAttribute('aria-expanded', 'false');
				});
				list.appendChild(li);
			});
			list.hidden = false;
			el(f.text).setAttribute('aria-expanded', 'true');
		}

		['pickup', 'dropoff'].forEach(function (kind) {
			const input = el(fields[kind].text);
			const search = debounce(function () {
				const value = input.value.trim();
				if (value.length < 3) {
					renderSuggestions(kind, []);
					return;
				}
				api('places/autocomplete', { input: value, session: state.session[kind] }).then(function (res) {
					renderSuggestions(kind, (res.data && res.data.suggestions) || []);
				});
			}, 300);
			input.addEventListener('input', function () {
				clearPoint(kind);
				invalidate();
				el('tmb-quote').textContent = '';
				search();
			});
			input.addEventListener('blur', function () {
				setTimeout(function () { renderSuggestions(kind, []); }, 150);
			});
		});

		// Localização atual do cliente.
		const gps = el('tmb-gps');
		if (gps) {
			gps.addEventListener('click', function () {
				if (!navigator.geolocation) {
					el('tmb-quote').textContent = t.gpsFail;
					return;
				}
				navigator.geolocation.getCurrentPosition(function (pos) {
					const lat = pos.coords.latitude;
					const lng = pos.coords.longitude;
					api('places/reverse', { lat: lat, lng: lng }).then(function (res) {
						const address = (res.data && res.data.address) || '';
						el(fields.pickup.text).value = address || (lat.toFixed(5) + ', ' + lng.toFixed(5));
						setPoint('pickup', { lat: lat, lng: lng, address: address });
					});
				}, function () {
					el('tmb-quote').textContent = t.gpsFail;
				}, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
			});
		}

		// Cotação: só quando há recolha, destino, data e hora.
		const scheduleQuote = debounce(requestQuote, 400);
		['tmb-date', 'tmb-time'].forEach(function (id) {
			el(id).addEventListener('change', scheduleQuote);
		});

		function pointPayload(kind) {
			const f = fields[kind];
			const place = el(f.place).value;
			if (place) {
				const p = { place_id: place };
				if (placeSession[kind]) { p.session = placeSession[kind]; }
				return p;
			}
			if (f.lat && el(f.lat).value) {
				return { lat: parseFloat(el(f.lat).value), lng: parseFloat(el(f.lng).value), address: el(f.text).value };
			}
			return null;
		}

		function requestQuote() {
			const out = el('tmb-quote');
			const pickup = pointPayload('pickup');
			const dropoff = pointPayload('dropoff');
			invalidate();
			if (!pickup || !dropoff || !el('tmb-date').value || !el('tmb-time').value) {
				out.textContent = (pickup || dropoff) && (!pickup || !dropoff) ? t.choose : '';
				return;
			}
			out.textContent = t.calculating;
			api('quote', { pickup: pickup, dropoff: dropoff }).then(function (res) {
				const d = res.data || {};
				out.innerHTML = '';
				if (d.quote_id) {
					state.quoteId = d.quote_id;
					state.canSubmit = true;
					state.pending = d.status !== 'ok';
					// Recalcula sozinho pouco antes de a cotação expirar.
					state.expiry = setTimeout(function () {
						out.textContent = t.expired;
						requestQuote();
					}, Math.max(30, (d.expires_in || 600) - 20) * 1000);
				}
				if (d.status === 'ok') {
					out.appendChild(text('p', 'tmb-total', t.total + ': ' + d.total + (d.vat_label ? ' (' + d.vat_label + ')' : '')));
					out.appendChild(text('p', 'tmb-note',
						t.trip + ' ' + d.trip_km + ' km (' + d.trip_price + ') · ' +
						t.pickup + ' ' + d.pickup_chargeable_km + ' ' + t.chargeable + ' (' + d.pickup_price + ')'));
				} else if (d.reason === 'morada_invalida') {
					out.textContent = t.invalidPlace;
				} else if (d.reason === 'distancia_excede_maximo') {
					out.textContent = t.tooFar;
				} else if (d.status === 'preco_a_confirmar') {
					out.textContent = t.unconfirmed;
				} else {
					out.textContent = (d && d.message) || t.error;
				}
				updateSubmit();
			});
		}

		function updateSubmit() {
			el('tmb-submit').disabled = !state.canSubmit;
		}

		// Envio da reserva.
		form.addEventListener('submit', function (e) {
			e.preventDefault();
			const result = el('tmb-result');
			if (!state.canSubmit) {
				return;
			}
			const data = {
				quote_id: state.quoteId,
				name: el('tmb-name').value.trim(),
				phone: el('tmb-phone').value.trim(),
				email: el('tmb-email').value.trim(),
				date: el('tmb-date').value,
				time: el('tmb-time').value,
				passengers: parseInt(el('tmb-passengers').value, 10),
				bags: parseInt(el('tmb-bags').value, 10),
				payment: form.querySelector('input[name="payment"]:checked').value,
				notes: el('tmb-notes').value.trim(),
				consent: el('tmb-consent').checked,
			};
			result.textContent = t.sending;
			el('tmb-submit').disabled = true;
			form.querySelectorAll('[aria-invalid]').forEach(function (n) { n.removeAttribute('aria-invalid'); });
			api('booking', data).then(function (res) {
				if (res.ok) {
					result.innerHTML = '';
					result.appendChild(text('p', '', (res.data.price_pending ? t.sentPending : t.sent) + ' ' + res.data.ref));
					const a = text('a', '', res.data.url);
					a.href = res.data.url;
					result.appendChild(a);
					form.reset();
					clearPoint('pickup');
					clearPoint('dropoff');
					invalidate();
					el('tmb-quote').textContent = '';
					loadMine();
					return;
				}
				result.textContent = (res.data && res.data.message) || t.error;
				const bad = (res.data && res.data.data && res.data.data.fields) || [];
				const map = { name: 'tmb-name', phone: 'tmb-phone', email: 'tmb-email', datetime: 'tmb-date', passengers: 'tmb-passengers', bags: 'tmb-bags', notes: 'tmb-notes', consent: 'tmb-consent' };
				bad.forEach(function (f) { if (map[f] && el(map[f])) { el(map[f]).setAttribute('aria-invalid', 'true'); } });
				if (res.status === 409) {
					requestQuote(); // Cotação expirada ou usada: calcula de novo.
				} else {
					updateSubmit();
				}
			});
		});

		// Reservas deste browser (cookie HTTP-only lido pelo servidor).
		function loadMine() {
			const box = el('tmb-mine');
			const list = el('tmb-mine-list');
			if (!box || !list) { return; }
			api('mine', undefined, 'GET').then(function (res) {
				const items = Array.isArray(res.data) ? res.data : [];
				list.innerHTML = '';
				items.forEach(function (b) {
					const li = document.createElement('li');
					const a = text('a', '', b.ref + ' · ' + b.starts_local + ' · ' + b.status_label);
					a.href = b.url;
					li.appendChild(a);
					list.appendChild(li);
				});
				box.hidden = !items.length;
			});
		}
		loadMine();

		// Consultar reserva por código e telefone.
		const lookup = el('tmb-lookup-form');
		if (lookup) {
			lookup.addEventListener('submit', function (e) {
				e.preventDefault();
				const out = el('tmb-lookup-result');
				api('lookup', { ref: el('tmb-lookup-ref').value, phone: el('tmb-lookup-phone').value }).then(function (res) {
					if (res.ok && res.data.url) {
						window.location.href = res.data.url;
					} else {
						out.textContent = (res.data && res.data.message) || t.error;
					}
				});
			});
		}
	}

	/* ----------------------------------------------------------------
	 * Página de reserva: cancelamento
	 * ---------------------------------------------------------------- */
	const cancelBtn = document.getElementById('tmb-cancel');
	if (cancelBtn) {
		cancelBtn.addEventListener('click', function () {
			if (!window.confirm(t.confirmCancel)) {
				return;
			}
			cancelBtn.disabled = true;
			api('booking/' + cancelBtn.dataset.token + '/cancel', {}).then(function (res) {
				const out = document.getElementById('tmb-cancel-result');
				if (res.ok) {
					out.textContent = t.cancelled;
					const label = document.getElementById('tmb-status-label');
					if (label && res.data.status_label) { label.textContent = res.data.status_label; }
					cancelBtn.remove();
				} else {
					cancelBtn.disabled = false;
					out.textContent = (res.data && res.data.message) || t.error;
				}
			});
		});
	}

	/* ----------------------------------------------------------------
	 * Painel do motorista
	 * ---------------------------------------------------------------- */
	const duty = document.getElementById('tmb-duty');
	if (duty) {
		initDriver(duty);
	}

	function initDriver(duty) {
		let timer = null;
		const status = document.getElementById('tmb-duty-status');
		const list = document.getElementById('tmb-driver-list');

		function sendPosition() {
			if (!navigator.geolocation) { status.textContent = t.gpsFail; return; }
			navigator.geolocation.getCurrentPosition(function (pos) {
				api('driver/location', { lat: pos.coords.latitude, lng: pos.coords.longitude });
			}, function () {
				status.textContent = t.gpsFail;
			}, { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 });
		}

		function setOn(on) {
			duty.setAttribute('aria-pressed', on ? 'true' : 'false');
			duty.textContent = on ? t.driverOn : t.driverEnter;
			status.textContent = on ? t.driverOn : t.driverOff;
			clearInterval(timer);
			if (on) {
				sendPosition();
				timer = setInterval(sendPosition, 60000);
			}
		}

		duty.addEventListener('click', function () {
			const next = duty.getAttribute('aria-pressed') !== 'true';
			duty.disabled = true;
			api('driver/duty', { on_duty: next }).then(function (res) {
				duty.disabled = false;
				if (res.ok) {
					setOn(!!res.data.on_duty);
				} else {
					status.textContent = (res.data && res.data.message) || t.error;
				}
			});
		});

		// Ao voltar ao separador, envia logo a posição (os browsers abrandam temporizadores em segundo plano).
		document.addEventListener('visibilitychange', function () {
			if (!document.hidden && duty.getAttribute('aria-pressed') === 'true') {
				sendPosition();
				renderList();
			}
		});

		const actions = {
			pending: { next: 'confirmed', label: t.actConfirm },
			confirmed: { next: 'in_progress', label: t.actStart },
			in_progress: { next: 'completed', label: t.actComplete },
		};

		function renderList() {
			api('driver/bookings', undefined, 'GET').then(function (res) {
				list.innerHTML = '';
				const items = Array.isArray(res.data) ? res.data : [];
				if (!items.length) {
					list.appendChild(text('p', 'tmb-note', res.ok ? t.driverEmpty : ((res.data && res.data.message) || t.error)));
					return;
				}
				items.forEach(function (b) {
					const card = document.createElement('article');
					card.className = 'tmb-card tmb-status-' + b.status;
					card.appendChild(text('h4', '', b.starts_local + ' · ' + b.ref + ' · ' + b.status_label));
					card.appendChild(text('p', '', b.customer_name + ' · ' + b.passengers + ' ' + t.pax + ' / ' + b.bags + ' ' + t.bags + ' · ' + b.payment_label));
					card.appendChild(text('p', '', t.from + ': ' + b.pickup_address + ' — ' + t.to + ': ' + b.dropoff_address));
					card.appendChild(text('p', '', t.total + ': ' + b.total));
					if (b.notes) {
						card.appendChild(text('p', 'tmb-note', t.notes + ': ' + b.notes));
					}
					const links = document.createElement('p');
					[['tel:' + b.customer_phone.replace(/[^\d+]/g, ''), t.call + ' ' + b.customer_phone], [b.whatsapp_url, 'WhatsApp'], [b.maps_url, t.navigate]].forEach(function (l) {
						const a = text('a', 'tmb-link', l[1]);
						a.href = l[0];
						a.rel = 'noopener';
						links.appendChild(a);
						links.appendChild(document.createTextNode(' '));
					});
					card.appendChild(links);
					const action = actions[b.status];
					if (action) {
						const btn = text('button', 'tmb-button', action.label);
						btn.type = 'button';
						btn.addEventListener('click', function () {
							btn.disabled = true;
							api('driver/bookings/' + b.id + '/status', { status: action.next }).then(renderList);
						});
						card.appendChild(btn);
					}
					list.appendChild(card);
				});
			});
		}

		renderList();
		setInterval(renderList, 120000);
		if (duty.getAttribute('aria-pressed') === 'true') {
			setOn(true);
		}
	}
})();
