var telegram = require('telegram-bot-api');
const fs = require('fs');

var ytdl = require('youtube-dl');
const path = require('path');
var ffmpeg = require('fluent-ffmpeg');

// separate file "config.js" contains token to be used
const bot_config= require('../youtube_Mp3/config');


//change the token here
var api = new telegram({
        token: bot_config.token1,
        updates: {
            enabled: true
    }
});



// checks new messages sent to th bot
api.on('message', function(message)
{
    // Received text message

    console.log(message);

    /**
          this function is to convert mp4 to mp3 
          https://stackoverflow.com/questions/30842316/video-to-audio-file-convert-save-through-ffmpeg-in-node-js
     *    input - string, path of input file
     *    output - string, path of output file
     *    callback - function, node-style callback fn (error, result)        
     */
    function convert(input, output, callback) {
        ffmpeg(input)
            .output(output)
            .on('end', function() {                    
                console.log('conversion ended');
                callback(null);
            }).on('error', function(err){
                console.log('error: ', err);
                callback(err);
            }).run();
    }

  




    // send Invalid url when anything but a msg is sent starting with https
    if (!message || message.text.toLowerCase().indexOf('https') < 0) 
    {
    // In case a message is not present, 
    // or if our message does not have the word marco in it, do nothing and return an empty response
       api.sendMessage({
          chat_id: message.chat.id,
          // you can also send file_id here as string (as described in telegram bot api documentation)
          text: 'INVALID URL'//("/home/gugli/Documents/script_py/Telegram/SmartBot/MeanAuthApp/%s.mp3")
        })

        .then(function(data)
        {
          console.log("ITS DONE ");
        }); 

    
    }
    else{
        
        api.sendMessage({
          chat_id: message.chat.id,
          // you can also send file_id here as string (as described in telegram bot api documentation)
          text: 'Processing....'//("/home/gugli/Documents/script_py/Telegram/SmartBot/MeanAuthApp/%s.mp3")
        })

        .then(function(data)
        {
          console.log("Processing message sent ");
        });



        /** downloading youtube mp4 
            tried downloading directly mp3 but didnt understant how to get its file name 
            after its downloaded
            below is the code to directly download it but didnt know how to make use of it
           
            // ytdl.exec(message.text, ['-x', '--audio-format', 'mp3'], {}, function(err, output) {
            //   if (err) throw err;
            //   console.log(output.join('\n'));
            //   console.log("%%%%%%%%%%%%%");
            //   // output.pipe(fs.createWriteStream(file));
            //   // console.log(output)
            // })

        **/

        var file ;
        var video = ytdl(message.text,
        // Optional arguments passed to youtube-dl.
        // no use of below specifics; doesnt work;
        ['-x', '--audio-format', 'mp3']);

        // this gets the filename of the video
        // every thing here is copy and pasted
        video.on('info', function(info) {
            'use strict';
            console.log('Got audio info');
            console.log(info._filename)
            
            file = path.join(__dirname, info._filename);
            video.pipe(fs.createWriteStream(file));
        
         });

        // video.pipe(fs.createWriteStream(file));
        // console.log(file)
        console.log(typeof file)
        console.log("@@@@@@@@@==========@@@@@@@@@@@@@@@@@@@")

        // this runs after the file has been downloaded
        // https://www.npmjs.com/package/youtube-dl
        video.on('end', function() {
            console.log('finished downloading!');
            console.log(typeof file)
            console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@")
            // });

            filemp3 = file.replace('.mp4', '.mp3') //output: 'A D C'

            convert(file, filemp3 , function(err){
               if(!err) {
                   console.log('conversion complete');
                   
               }
            // });

           

                api.sendAudio({
                  chat_id: message.chat.id,
                  // you can also send file_id here as string (as described in telegram bot api documentation)
                  audio:filemp3// "/home/gugli/Documents/script_py/Telegram/SmartBot/MeanAuthApp/mb.mp4"
                })

                .then(function(data)
                {
                    console.log("ITS DONE ");

                    /** delete file 
                        https://stackoverflow.com/questions/14295878/delete-several-files-in-node-js
                    fs.unlink([filemp3,file], function (err) {
                        if (err) throw err;
                        // if no error, file has been deleted successfully
                        console.log('File deleted!');
                    }); 

                    **/
                    fs.unlinkSync(file);
                    fs.unlinkSync(filemp3);

    
                })
                .catch(err => {
                  // ...and here if it was not
                  console.log('Error :', err)
                 
                });
            });


        });
    



}


});


// https://github.com/mast/telegram-bot-api
// http://mvalipour.github.io/node.js/2015/11/10/build-telegram-bot-nodejs-heroku

// https://www.sohamkamani.com/blog/2016/09/21/making-a-telegram-bot/
// run node ./app.js