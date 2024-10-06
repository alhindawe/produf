document.addEventListener('DOMContentLoaded', function() {

    let frontImageData = null;
    let backImageData = null;
    let videoStream = null;
    let imageCount = 0; // عداد الصور الملتقطة

    const videoElement = document.getElementById('videoElement');
    const canvas = document.getElementById('canvas'); // لاستخدامه لالتقاط الصور
    const captureFrontBtn = document.getElementById('captureFront');
    const captureBackBtn = document.getElementById('captureBack');
    const saveImageBtn = document.getElementById('saveImage');
    const imageNameInput = document.getElementById('imageName');
    const imageNameContainer = document.getElementById('imageNameContainer');
    const saveContainer = document.getElementById('saveContainer');
    const videoContainer = document.getElementById('videoContainer');
    const takePhotoBtn = document.getElementById('takePhotoBtn');
    const takePhotoContainer = document.getElementById('takePhotoContainer');
    const imageCountDisplay = document.getElementById('imageCount');
    const newPhotoBtn = document.getElementById('newPhotoBtn');

    /**
     * بدء الكاميرا الخلفية
     */
    function startCamera() {
        const constraints = {
            video: {
                facingMode: "environment" // طلب استخدام الكاميرا الخلفية
            }
        };

        navigator.mediaDevices.getUserMedia(constraints)
            .then((stream) => {
                videoStream = stream;
                videoElement.srcObject = stream;
                videoContainer.style.display = 'block';
                takePhotoContainer.style.display = 'block';
            })
            .catch((err) => {
                alert('فشل الوصول إلى الكاميرا: ' + err);
            });
    }

    /**
     * إيقاف الكاميرا وتحرير الموارد
     */
    function stopCamera() {
        if (videoStream) {
            videoStream.getTracks().forEach(track => track.stop());
            videoStream = null;
        }
        videoContainer.style.display = 'none';
        takePhotoContainer.style.display = 'none';
    }

    /**
     * التقاط الصورة من الفيديو
     * @returns {string|null} بيانات الصورة بتنسيق Base64 أو null في حالة الفشل
     */
    function captureImage() {
        const context = canvas.getContext('2d');
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/png');
    }

    /**
     * معالجة زر "التقاط وجه البطاقة"
     */
    captureFrontBtn.addEventListener('click', () => {
        startCamera();
        captureFrontBtn.style.display = 'none';
        captureBackBtn.style.display = 'none';

        alert('قم بتوجيه الكاميرا نحو وجه البطاقة.');

        // إظهار زر التقاط الصورة
        takePhotoContainer.style.display = 'block';

        // تعيين وظيفة التقاط الصورة لزر "التقاط الصورة"
        takePhotoBtn.onclick = function() {
            frontImageData = captureImage();
            if (frontImageData) {
                imageCount++; // زيادة العداد
                imageCountDisplay.textContent = imageCount; // تحديث العداد
                stopCamera();

                captureFrontBtn.textContent = 'إعادة التقاط وجه البطاقة';
                captureFrontBtn.style.display = 'inline-block';
                captureBackBtn.disabled = false;
                captureBackBtn.style.display = 'inline-block';

                // إظهار زر التقاط صورة جديدة
                newPhotoBtn.style.display = 'inline-block';
                takePhotoContainer.style.display = 'none';
            }
        };
    });

    /**
     * معالجة زر "التقاط ظهر البطاقة"
     */
    captureBackBtn.addEventListener('click', () => {
        startCamera();
        captureFrontBtn.style.display = 'none';
        captureBackBtn.style.display = 'none';

        alert('قم بتوجيه الكاميرا نحو ظهر البطاقة.');

        // إظهار زر التقاط الصورة
        takePhotoContainer.style.display = 'block';

        // تعيين وظيفة التقاط الصورة لزر "التقاط الصورة"
        takePhotoBtn.onclick = function() {
            backImageData = captureImage();
            if (backImageData) {
                imageCount++; // زيادة العداد
                imageCountDisplay.textContent = imageCount; // تحديث العداد
                stopCamera();

                captureBackBtn.textContent = 'إعادة التقاط ظهر البطاقة';
                captureBackBtn.style.display = 'inline-block';

                // إظهار زر التقاط صورة جديدة
                newPhotoBtn.style.display = 'inline-block';
                takePhotoContainer.style.display = 'none';

                // تحقق من وجود الصورتين
                if (frontImageData && backImageData) {
                    imageNameContainer.style.display = 'block';
                    saveContainer.style.display = 'block';
                    saveImageBtn.disabled = false;
                }
            }
        };
    });

    /**
     * معالجة زر "حفظ الصورة"
     */
    saveImageBtn.addEventListener('click', async () => {
        const mergedImageData = await mergeImages();
        const imageName = imageNameInput.value.trim() || 'صورة البطاقة';

        // إنشاء رابط التنزيل
        const link = document.createElement('a');
        link.href = mergedImageData;
        link.download = `${imageName}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        alert('تم حفظ الصورة بنجاح.');

        // إعادة تعيين التطبيق
        resetApp();
    });

    /**
     * دمج الصور الملتقطة في صورة واحدة
     * @returns {Promise<string>} بيانات الصورة المدمجة بتنسيق Base64
     */
    function mergeImages() {
        return new Promise((resolve) => {
            const imgFront = new Image();
            const imgBack = new Image();
            imgFront.src = frontImageData;
            imgBack.src = backImageData;

            let imagesLoaded = 0;

            function checkLoaded() {
                imagesLoaded++;
                if (imagesLoaded === 2) {
                    const mergedCanvas = document.createElement('canvas');
                    const maxWidth = Math.max(imgFront.width, imgBack.width);
                    const totalHeight = imgFront.height + imgBack.height;

                    mergedCanvas.width = maxWidth;
                    mergedCanvas.height = totalHeight;

                    const ctx = mergedCanvas.getContext('2d');
                    ctx.drawImage(imgFront, 0, 0);
                    ctx.drawImage(imgBack, 0, imgFront.height);

                    resolve(mergedCanvas.toDataURL('image/png'));
                }
            }

            imgFront.onload = checkLoaded;
            imgBack.onload = checkLoaded;
        });
    }

    /**
     * إعادة تعيين التطبيق إلى الحالة الافتراضية
     */
    function resetApp() {
        frontImageData = null;
        backImageData = null;
        captureFrontBtn.textContent = 'التقاط وجه البطاقة';
        captureBackBtn.textContent = 'التقاط ظهر البطاقة';
        captureBackBtn.disabled = true;

        imageNameInput.value = '';
        imageNameContainer.style.display = 'none';
        saveContainer.style.display = 'none';
        saveImageBtn.disabled = true;

        // إخفاء زر التقاط الصورة
        takePhotoContainer.style.display = 'none';
        newPhotoBtn.style.display = 'none'; // إخفاء زر التقاط صورة جديدة
    }

    /**
     * إيقاف الكاميرا عند إعادة تحميل الصفحة أو إغلاقها
     */
    window.addEventListener('beforeunload', () => {
        stopCamera();
    });

    // إضافة حدث لزر "التقاط صورة جديدة"
    newPhotoBtn.addEventListener('click', () => {
        resetApp(); // إعادة تعيين التطبيق
        captureFrontBtn.style.display = 'inline-block'; // إظهار زر التقاط الوجه
        captureBackBtn.style.display = 'inline-block'; // إظهار زر التقاط الظهر
    });

});