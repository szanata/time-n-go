$(function () {
  Array(10).fill().forEach( (_, i) => {
    $( '.digit-wheel.ten' ).append( $( `<div class="digit"><span>${i}</span></div>` ) );
  });
  Array(6).fill().forEach( (_, i) => {
    $( '.digit-wheel.six' ).append( $( `<div class="digit"><span>${i}</span></div>` ) );
  });
});
