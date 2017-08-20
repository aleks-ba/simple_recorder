import Recorder from './recorder';

class MyRecorder {

    constructor() {
        let krakoz = 2;
        this.mediaStream = null;
        this.rec = null;
        const Context = window.AudioContext || window.webkitAudioContext;
        this.context = new Context();
        this.audioTracks = [];
        this.currentTrackElement = null;
    }

    record = (event) => {
        this.currentTrackElement = event.target.closest('.track-list--item');
debugger;
        if (typeof this.baseTrack !== 'undefined') {
            this.baseTrack.pause();
            this.baseTrack.currentTime = 0;
            this.baseTrack.play();
            this.baseTrack.addEventListener('playing', () => {
                console.log('clear rec');
                this.rec.clear();
            }, false);
        }
        navigator.getUserMedia({audio: true}, (localMediaStream) => {
            this.mediaStream = localMediaStream;

            // create a stream source to pass to Recorder.js
            var mediaStreamSource = this.context.createMediaStreamSource(localMediaStream);

            // create new instance of Recorder.js using the mediaStreamSource
            this.rec = new Recorder(mediaStreamSource, {
                // pass the path to recorderWorker.js file here
                workerPath: '/bower_components/Recorderjs/recorderWorker.js'
            });

            // start recording
            this.rec.record();
        }, function (err) {
            console.log('Browser not supported');
        });
    };

    stop = () => {
        // stop the media stream
        // stop Recorder.js
        this.rec.stop();

        this.rec.exportWAV(this._exportToWavCallback);
    };

    _exportToWavCallback = (blob) => {
        this.rec.clear();

        if (this.currentTrackElement.isRecorded) {
            return;
        }
        const url = window.URL.createObjectURL(blob);
        const audioHTML = document.createElement('audio');
        audioHTML.src = url;
        audioHTML.setAttribute('controls', true);
        audioHTML.setAttribute('loop', true);

        this.audioTracks.push(audioHTML);
        this.baseTrack = this.audioTracks[0];

        this.currentTrackElement.isRecorded = true;

        this.currentTrackElement.appendChild(audioHTML);
    };

    playAllTracks = () => {
        this.audioTracks.forEach((audio) => {
            audio.currentTime = 0;
            audio.play();
        });
    };

    addNewTrack = () => {
        const template =
            `<div onclick="Recorder.default.record(event)" class="button-control button-control-rec"><span></span></div>
             <div onclick="Recorder.default.stop()" class="button-control button-control-stop"><span></span></div>
            `;

        var trackListItemHTML = document.createElement('div');
        trackListItemHTML.classList.add('track-list--item');
        trackListItemHTML.innerHTML = template;
        document.querySelector('.track-list').appendChild(trackListItemHTML);
    }
}


export default new MyRecorder();