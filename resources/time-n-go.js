$(function () {
  const Statuses = { STARTED:1, STOP:0, CLEAN:3 };

  const updateTile = ( { m, s, ms } ) => document.title = `${m}:${s}.${ms}`;

  const initState = () => ({
    pauseTime: 0,
    referenceTime: 0,
    status: Statuses.CLEAN,
    currentTimeStr: { m: '00', s: '00', ms: '000' },
    timerLoop: null
  });

  const stop = state => {
    state.status = Statuses.STOP;
    clearInterval( state.timerLoop );
    updateTile( state.currentTimeStr );
    state.pauseTime = Date.now();

    $( '.digit-wheel' ).removeClass( 'spinning' );
  };

  const resetWheels = () => new Promise( resolve => {
    $( '.digit-wheel' ).each( function (e) {
      const style = window.getComputedStyle( $( this ).get( 0 ) );
      const matrix3d = style.getPropertyValue( 'transform' );
  
      $( this ).css( { animation: 'none', transform: matrix3d, transition: 'transform 500ms' })
        .addClass( 'reset' );
    });
  
    setTimeout( () => {
      $( '.digit-wheel' ).attr( 'style', '' ).removeClass( 'reset' );
      resolve();
    }, 500);
  } )

  const start = state => {
    state.status = Statuses.STARTED;
    state.referenceTime = !state.pauseTime ? Date.now() : state.referenceTime + (Date.now() - state.pauseTime);

    $( '.digit-wheel' ).addClass( 'spinning' );

    state.timerLoop = setInterval( () => {
      const time = Date.now() - state.referenceTime;
      const ms = String( time % 1000 ).padStart( 3, 0 );
      const m = String( Math.floor( time / 1000 / 60 ) ).padStart( 2, 0 );
      const s = String( Math.floor( time / 1000 ) - ( m * 60 ) ).padStart( 2, 0 );
      state.currentTimeStr = { ms, m, s };

      updateTile( state.currentTimeStr )
    }, 21 );
  };

  let currentState = initState();
      
  $( '.action' ).on( 'click', e => {
    e.preventDefault();
    if ( [ Statuses.STOP, Statuses.CLEAN ].includes( currentState.status ) ) {
      start( currentState );
      $( '.action' ).addClass( 'active' ).removeClass( 'paused' );
    } else {
      stop( currentState );
      $( '.action' ).addClass( 'paused' ).removeClass( 'active' );
    }
  });

  $( document ).on( 'keypress', e => {
    if ( e.charCode === 32 ) { // space
      $( '.action' ).trigger( 'click' );
    }
  });
  
  $( '.reset' ).on( 'click', async e => {
    e.preventDefault();

    stop( currentState );
    $( '.action' ).addClass( 'disabled paused' ).removeClass( 'active' );
    $( '.reset' ).addClass( 'active' );

    currentState = initState();
    
    await resetWheels();

    $( '.action' ).removeClass( 'disabled' );
    $( '.reset' ).removeClass( 'active' );

    document.title = 'Time\'n\'go';
  });
});
