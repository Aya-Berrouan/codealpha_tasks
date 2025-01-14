import { useState, useRef } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { motion } from 'framer-motion';

const ImageCropper = ({ image, onCropComplete, onCancel }) => {
    const [crop, setCrop] = useState({
        unit: '%',
        width: 80,
        height: 80,
        x: 10,
        y: 10,
        aspect: 1
    });
    const [completedCrop, setCompletedCrop] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const imgRef = useRef(null);

    const onImageLoad = (e) => {
        const { width, height } = e.currentTarget;
        const cropWidth = Math.min(width, height) * 0.8;
        const x = (width - cropWidth) / 2;
        const y = (height - cropWidth) / 2;

        setCrop({
            unit: 'px',
            width: cropWidth,
            height: cropWidth,
            x: x,
            y: y,
            aspect: 1
        });
    };

    const getCroppedImg = async (image, crop) => {
        const canvas = document.createElement('canvas');
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        canvas.width = crop.width;
        canvas.height = crop.height;
        const ctx = canvas.getContext('2d');

        ctx.beginPath();
        ctx.arc(crop.width / 2, crop.height / 2, crop.width / 2, 0, Math.PI * 2);
        ctx.clip();

        ctx.drawImage(
            image,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            crop.width,
            crop.height
        );

        return new Promise((resolve) => {
            canvas.toBlob(blob => {
                if (!blob) {
                    console.error('Canvas is empty');
                    return;
                }
                blob.name = 'cropped.jpg';
                resolve(blob);
            }, 'image/jpeg', 1);
        });
    };

    const handleCropComplete = async () => {
        if (!completedCrop || !imgRef.current) {
            console.error('Please make a crop selection first');
            return;
        }

        setIsLoading(true);
        try {
            const croppedImage = await getCroppedImg(imgRef.current, completedCrop);
            if (croppedImage) {
                onCropComplete(croppedImage);
            }
        } catch (e) {
            console.error('Error cropping image:', e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-2xl p-6 max-w-2xl w-full"
            >
                <h3 className="text-xl font-medium text-gray-900 mb-4">
                    Crop Your Profile Picture
                </h3>
                <div className="mb-6">
                    <ReactCrop
                        crop={crop}
                        onChange={c => setCrop(c)}
                        onComplete={c => setCompletedCrop(c)}
                        aspect={1}
                        circularCrop
                        className="rounded-full"
                    >
                        <img
                            ref={imgRef}
                            src={image}
                            alt="Crop me"
                            className="max-h-[60vh] w-auto mx-auto"
                            onLoad={onImageLoad}
                        />
                    </ReactCrop>
                </div>
                <div className="flex justify-end gap-4">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCropComplete}
                        disabled={isLoading || !completedCrop}
                        className="px-6 py-2 bg-iris text-white rounded-full hover:bg-iris/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default ImageCropper; 