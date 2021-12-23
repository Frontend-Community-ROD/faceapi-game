import '../libraries/face-api.js';

export default class FaceApiService {
    #detections = {};

    get detections() {
        return this.#detections;
    }

    /**
     * The face recognition API service
     * @param {HTMLVideoElement} video The HTML video element
     */
    constructor(video) {
        this.#init(video);
    }

    /**
     * Loads all available models, initializes the webcam and sets the play event listener
     * @param {HTMLVideoElement} video The HTML video element
     */
    #init(video) {
        const root = location.href.slice(0, location.href.lastIndexOf('/'));

        Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(`${root}/js/libraries/models`),
            faceapi.nets.faceRecognitionNet.loadFromUri(`${root}/js/libraries/models`),
            faceapi.nets.faceExpressionNet.loadFromUri(`${root}/js/libraries/models`)
            // faceapi.nets.faceLandmark68Net.loadFromUri(`${root}/js/libraries/models`),
            // faceapi.nets.ageGenderNet.loadFromUri(`${root}/js/libraries/models`)
        ])
            .then(() => {
                this.#setWebcam(video);
                video.addEventListener('play', e => {
                    this.#onVideoPlay(e);
                    document.body.classList.remove('loading');
                });
            })
            .catch(() => {
                throw new Error('There was an error initializing the face recognition API');
            });
    }

    /**
     * Initializes the webcam
     * @param {HTMLVideoElement} video The HTML video element
     */
    #setWebcam(video) {
        navigator.getUserMedia =
            navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.msGetUserMedia;

        navigator.getUserMedia(
            { video: true },
            stream => {
                video.srcObject = stream;
            },
            error => console.log(error)
        );
    }

    /**
     * The callback for the "play" event listener
     * @param {Event} e The event
     */
    #onVideoPlay(e) {
        const videoWrapper = e.target.parentElement;
        const canvas = faceapi.createCanvasFromMedia(video);
        // const context = canvas.getContext('2d');
        const size = { width: videoWrapper.clientWidth, height: videoWrapper.clientHeight };

        faceapi.matchDimensions(canvas, size);
        videoWrapper.append(canvas);

        setInterval(async () => {
            const detectorOptions = new faceapi.TinyFaceDetectorOptions();
            const detector = await faceapi
                .detectSingleFace(e.target, detectorOptions)
                .withFaceExpressions();
            // .withFaceLandmarks()
            // .withAgeAndGender()

            if (detector) {
                const detections = faceapi.resizeResults(detector, size);
                this.#detections = detections;

                // #region Draw detections
                // context.clearRect(0, 0, canvas.width, canvas.height);

                // faceapi.draw.drawDetections(canvas, detections);
                // faceapi.draw.drawFaceLandmarks(canvas, detections);
                // faceapi.draw.drawFaceExpressions(canvas, detections);

                // Age detection
                // detections.forEach(detection => {
                //     const box = detection.detection.box;
                //     const drawBox = new faceapi.draw.DrawBox(box, {
                //         label: Math.round(detection.age) + ' year old ' + detection.gender
                //     });
                //     drawBox.draw(canvas);
                // });
                // #endregion
            }
        }, 100);
    }
}
