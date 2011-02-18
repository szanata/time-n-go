/**
* padLeft implementation
*/
String.prototype.padLeft = function (ch, num) {

  var 
    re = new RegExp(".{" + num + "}$"),
    pad = "";
    
  do {
    pad += ch;
  }while(pad.length < num);
  
  return re.exec(pad + this)[0];
}

Number.prototype.trunc = function () {
  return this | 0;
}

$(function (){

  //disable CTRL +A
  $(window).bind('keydown keyup keypress',function (e){
    if (e.keyCode === 65 && e.ctrlKey){
      return false;
    }
  });

  /**
  * creates the tooltip
  */
  $('body').append('<div id="tip-wrapper"><div id="tip-arrow-border"></div><div id="tip-arrow"></div><div id="tip-body"></div></div>');
  
  $('#tip-body').append('Thanks for using my stopwatch. Please visit my site:<a href="http://www.iceon.me" target="blank">iceon.me</a>');  
  
  /**
  * write the obscure screen elements
  */
  $('.digit').wrap('<div class="digit-wrapper" data-current="true"></div>');
  
  $('.digit-case').prepend('<div class="digit-wrapper" style="margin-top:-200px;"><span class="digit"></span></div>');
  
  $('.digit-case').prepend('<div class="pusher"></div>');
  
  $('#timeCheckContent').val('00:00.000');
  
  $('*').not('#timeCheckContent').disableSelection();
  
  /**
  * fast change a digit on screen
  */
  function fastChange(name,digit){
    
    $(name).find('.digit').text(digit);
  }
  
  /**
  * exchange the digit, performing animation
  */
  function changeDigit(name,nextDigit,duration){

    $(name).find('.digit').first().text(nextDigit);
    
    if (!$(name).find(':animated').size()){
    
      $(name).find('.pusher').animate({height:200},{
      
        duration: duration || 250,
        complete: function (){
            
          $(this).siblings('div[data-current=true]').remove();
          
          $(this).siblings('.digit-wrapper').css('margin-top','0px');
          
          $(this).siblings('.digit-wrapper').attr('data-current','true');
          
          $(this).css('margin-top','-200px');
          
          $(this).html('<span class="digit"></span>');
          
          $(this).switchClass('pusher','digit-wrapper');
          
          $(this).parent().prepend('<div class="pusher"></div>');
          
          $(this).find('*').disableSelection();
        }
      });
    }
  }

  var engine = (function (){
  
    var
      states = {STARTED:1,STOPPED:0,RESETED:3},
      mmssThread = null,
      millisecondThread = null,
      timeCheckThread = null,
      lastMinutes = ['0','0'],
      lastSeconds = ['0','0'],
      lastMillis = ['0','0','0'],
      stopTime = undefined,
      lastTime = null;
      state = states.STOPPED;

      function stop(){
      
        clearInterval(mmssThread);
        
        clearInterval(millisecondThread);
        
        clearInterval(timeCheckThread);

        stopTime = new Date().getTime();
      }
      
      function start(){
      
        if (!stopTime){
          lastTime = new Date().getTime();
        }else{
          lastTime = lastTime + (new Date().getTime() - stopTime);
        }
      
        /**
        * time check thread
        */
        timeCheckThread = setInterval(function (){
          var 
            total = (new Date().getTime() - lastTime),
            mm = (total / 60000).trunc().toString().padLeft('0',2),
            ss = ((total / 1000) - (mm * 60)).trunc().toString().padLeft('0',2),
            fff = (total - (ss * 1000) - (mm * 60)).toString().padLeft('0',3);
            console.log([mm,':',ss,'.',fff].join(''));
            
            $('#timeCheckContent').val([mm,':',ss,'.',fff].join(''));
        },31);
      
        /**
        * performs the milliseconds progress
        */
        millisecondThread = setInterval(function (){
          
          var millis = (new Date().getTime() - lastTime).toString().padLeft('0',3).split('');
          
          if (lastMillis[0] !== millis[0]){
            fastChange('#millisecond_1',millis[0]);
            lastMillis[0] = millis[0];
          }
          
          if (lastMillis[1] !== millis[1]){
            fastChange('#millisecond_2',millis[1]);
            lastMillis[1] = millis[1];
          }
          
          if (lastMillis[2] !== millis[2]){
            fastChange('#millisecond_3',millis[2]);
            lastMillis[2] = millis[2];
          }
        },31);
        
        mmssThread = setInterval(function (){
          
          var 
            time = new Date().getTime() - lastTime,
            seconds = ((time / 1000) - ((time / 60000).trunc() * 60)).trunc().toString().padLeft('0',2).split(''),
            minutes = null;
          
          if (lastSeconds[1] !== seconds[1]){
            
            changeDigit("#second_2",seconds[1]);
            
            lastSeconds[1] = seconds[1];
            
            if (lastSeconds[0] !== seconds[0]){
              
              minutes = (time / 60000).trunc().toString().padLeft('0',2).split(''),
            
              changeDigit("#second_1",seconds[0]);
              
              lastSeconds[0] = seconds[0];
              
              if (lastMinutes[1] !== minutes[1]){
              
                changeDigit("#minute_2",minutes[1]);
                
                lastMinutes[1] = minutes[1];
                
                if (lastMinutes[0] !== minutes[0]){
                
                  changeDigit("#minute_1",minutes[0]);
                  
                  lastMinutes[0] = minutes[0];
                }
              }
            }
          }
        },201);
      }
      
    return  {
      
      action: function (){

        if (state === states.STOPPED || state === states.RESETED){
    
          state = states.STARTED;
          
          start();
          
          $('#action').text('Stop');
        
        }else{
      
          state = states.STOPPED;
          
          stop();
          
          $('#action').text('Start');
        }
      },
    
      reset: function (){
      
        if (state === states.RESETED){
          return;
        }

        if (state === states.STARTED){
        
          stop();
          
          $('#action').text('Start');
        }
        
        state = states.RESETED;
        
        mmssThread = null;
        millisecondThread = null;
        lastMinutes = ['0','0'];
        lastSeconds = ['0','0'];
        lastMillis = ['0','0','0'];
        stopTime = undefined;
        lastTime = null;
        
        $('#timeCheckContent').val('00:00.000');
        
        var resetThread = setInterval(function (){
        
          if (!$('#dial :animated').size()){
          
            changeDigit("#minute_1",0);
            changeDigit("#minute_2",0);
            changeDigit("#second_1",0);
            changeDigit("#second_2",0);
            changeDigit("#millisecond_1",0);
            changeDigit("#millisecond_2",0);
            changeDigit("#millisecond_3",0);
            clearInterval(resetThread);
          }
        },20);
      },
    }
  })();
  
  $('#action').bind('click',engine.action);
  
  $('#reset').bind('click',engine.reset);

});
