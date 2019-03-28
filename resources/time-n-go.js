$(function () {
  const Statuses = { STARTED:1, STOP:0, CLEAN:3 };

  const Placers = {
    ms1: '#millisecond_1',
    ms2: '#millisecond_2',
    ms3: '#millisecond_3',
    s1: '#second_1',
    s2: '#second_2',
    m1: '#minute_1',
    m2: '#minute_2'
  };
  
  // write the hidden elemtns to perform nmumber changes
  $('.digit-wheel').prepend('<div class="digit" style="margin-top:-200px;"></div>')
    .prepend('<div class="pusher"></div>');

  // UI interactions
  
  // change digit without animation
  const fastChange = ( name, value ) => $( name ).find( '.digit[data-current]' ).text( value );
  
  // change the digit, performing animation
  const changeDigit = ( name, value, duration = 350 ) => {
    const el = $( name );
    const currentDigit = el.find( '.digit[data-current]' );
    const nextDigit = el.find( '.digit:not([data-current])' );
    const pusher = el.find( '.pusher' );

    const currentValue = currentDigit.text();
    if ( currentValue === value ) { return; }

    nextDigit.text( value );
    
    pusher.animate( { height: 200 }, {
      duration,
      complete: function () {
        currentDigit.text( value );
        currentDigit.remove();
        nextDigit.replaceWith( currentDigit.clone() );
        pusher.replaceWith( nextDigit.clone() );
        el.prepend( pusher.clone().height( 0 ) );
      }
    });
  };

  const updateTile = ( { m, s, ms } ) => document.title = `${m}:${s}.${ms}`;

  const resetPlacers = () => setTimeout( () => Object.values( Placers ).forEach( v => changeDigit( v, 0 ) ), 20);

  // Internal Stuff

  const initState = () => ({
    pauseTime: 0,
    referenceTime: 0,
    status: Statuses.CLEAN,
    currentTimeStr: { m: '00', s: '00', ms: '000' },
    timerLoop: null,
    titleUpdateLoop: null,
  });

  const stop = state => {
    state.status = Statuses.STOP;
    clearInterval( state.timerLoop );
    clearInterval( state.titleUpdateLoop );
    updateTile( state.currentTimeStr );
    state.pauseTime = Date.now();
  };

  const start = state => {
    state.status = Statuses.STARTED;
    state.referenceTime = !state.pauseTime ? Date.now() : state.referenceTime + (Date.now() - state.pauseTime);

    state.titleUpdateLoop = setInterval( () => updateTile( state.currentTimeStr ) );
  
    state.timerLoop = setInterval( () => {
      const time = Date.now() - state.referenceTime;
      const millis = String(time % 1000).padStart( 3, 0);
      const minutes = String( Math.floor( time / 1000 / 60 ) ).padStart( 2, 0 );
      const seconds = String( Math.floor( time / 1000 ) - ( minutes * 60 ) ).padStart( 2, 0 );

      state.currentTimeStr.ms = millis;
      state.currentTimeStr.m = minutes;
      state.currentTimeStr.s = seconds;

      fastChange( Placers.ms1, millis[0] );
      fastChange( Placers.ms2, millis[1] );
      fastChange( Placers.ms3, millis[2] );
      changeDigit( Placers.s1,seconds[0] );
      changeDigit( Placers.s2,seconds[1] );
      changeDigit( Placers.m1,minutes[1] );
      changeDigit( Placers.m2,minutes[0] );
    }, 31);
  };

  let currentState = initState();
      
  $( '.action' ).on( 'click', () => {
    if ( [ Statuses.STOP, Statuses.CLEAN ].includes( currentState.status ) ) {
      start( currentState );
      $('#action').html( 'Stop' );
    } else {
      stop( currentState );
      $('#action').text( 'Start' );
    }
  });

  $( document ).on( 'keypress', e => {
    if ( e.charCode === 32 ) { // space
      $( '#action' ).trigger( 'click' );
    }
  });
  
  $( '.reset' ).on('click', () => {
    if ( currentState.status === Statuses.CLEAN ){ return; }

    stop( currentState );
    $('#action').text('Start');

    currentState = initState();
    resetPlacers();
    updateTile( currentState.currentTimeStr )
  });
});
