var through2 = require('through2')
var bl = require('bl')

module.exports = createStream

function createStream(width, height, options) {
    width  = typeof width  === 'number' && width
    height = typeof height === 'number' && height

    var stream = through2(write, flush)
    var concat = bl()

    if (!width && !height) {
        throw new Error(
            'At least one of "width" or "height" must be supplied'
        )
    }

    options = options || {}
    options.format = String(
        options.format || 'png'
    ).toLowerCase()

    if (options.mime) {
        options.format = require("mime").extension(options.mime); 
    }

    if (!/^png|jpg|jpeg$/g.test(options.format)) {
        throw new Error(
        'Invaild format supplied: "' + options.format + '". ' +
        'Must be either "png" or "jpg"'
        )
    }

    // this.options = options;

    return stream

    function write(chunk, enc, next) {
        concat.append(chunk)
        next()
    }

    function flush(next) {
        var self = this;
        var data = concat.slice();


        // var Jimp = require("jimp");

        // // open a file called "lenna.png"
        // Jimp.read(data, function (err, lenna) {
        //     if (err) throw err;
        //     lenna.quality(100)                 // set JPEG quality
        //         .cover(width, height)               
        //         .getBuffer("image/jpeg", function (err, buffer) {
        //             stream.push(buffer);
        //             next();
        //         });
        // });

        require('lwip').open(data, options.format, function(err, image){

            if (err) {
                stream.emit('error', err)
                stream.emit('close')
                return;
            }

            image.batch()
                .cover(width, height)
                .toBuffer('jpg', function (err, buffer) {

                    // var bufferStream = new stream.PassThrough();
                    // bufferStream.end( buffer );
                    // bufferStream.pipe( process.stdout );
                    stream.push(buffer);
                    next();
                });

        });
    }
}