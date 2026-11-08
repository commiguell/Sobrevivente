/**
 * Editor do bloco transfer-me/booking-form. Sem passo de compilação: usa os pacotes globais do WordPress.
 * A pré-visualização é feita no servidor, para mostrar exatamente o que o visitante vê.
 */
( function ( wp ) {
	'use strict';
	const el = wp.element.createElement;
	const useBlockProps = wp.blockEditor.useBlockProps;
	const ServerSideRender = wp.serverSideRender;

	wp.blocks.registerBlockType( 'transfer-me/booking-form', {
		edit: function () {
			const props = useBlockProps( { className: 'tmb-editor-preview' } );
			// O formulário não reage a cliques no editor: é só uma pré-visualização.
			return el( 'div', props, el( 'div', { inert: '' }, el( ServerSideRender, { block: 'transfer-me/booking-form' } ) ) );
		},
		save: function () {
			return null;
		},
	} );
} )( window.wp );
