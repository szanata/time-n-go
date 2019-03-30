$(function () {
  $( window ).on( 'load resize', () => {
    const ww = $( 'body' ).width();
    const dw = $( '#dial' ).width();
    const ratio = ww / dw;
    const finalRatio = ratio > 1 ? 1 : ratio;
    $( '#dial' ).css( 'transform', `scale(${finalRatio})` );
  }).trigger( 'resize' );
});
