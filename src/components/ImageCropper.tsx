import React, { useState, useCallback } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { Modal, Slider, Button } from 'antd';

interface ImageCropperProps {
    visible: boolean;
    imageSrc: string;
    onCancel: () => void;
    onCrop: (blob: Blob) => void;
}

const getCroppedImg = (image: HTMLImageElement, crop: Area): Promise<Blob> => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d')!;
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
    return new Promise((resolve) =>
        canvas.toBlob((blob) => blob && resolve(blob), 'image/png')
    );
};

export default function ImageCropper({ visible, imageSrc, onCancel, onCrop }: ImageCropperProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedArea, setCroppedArea] = useState<Area>({ width: 0, height: 0, x: 0, y: 0 });

    const onCropComplete = useCallback((_: Area, areaPixels: Area) => {
        setCroppedArea(areaPixels);
    }, []);

    const handleOk = async () => {
        const img = document.createElement('img');
        img.src = imageSrc;
        await new Promise((r) => (img.onload = r));
        const blob = await getCroppedImg(img, croppedArea);
        onCrop(blob);
    };

    return (
        <Modal visible={visible} onCancel={onCancel} onOk={handleOk} width={600}>
            <div style={{ position: 'relative', height: 400, background: '#333' }}>
                <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                />
            </div>
            <Slider
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(val) => setZoom(val)}
            />
        </Modal>
    );
}