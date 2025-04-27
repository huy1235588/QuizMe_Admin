import React, { useState, useCallback, useRef } from 'react';
import Cropper, { Area, CropperProps } from 'react-easy-crop';
import { Modal, Slider, Button, Row, Col, Typography, Space } from 'antd';
import { ZoomInOutlined, ZoomOutOutlined, RotateLeftOutlined, RotateRightOutlined } from '@ant-design/icons';

const { Title } = Typography;

interface ImageCropperProps {
    visible: boolean;
    imageSrc: string;
    onCancel: () => void;
    onCrop: (blob: Blob) => void;
    aspectRatio?: number;
}

/**
 * Creates a cropped image based on the crop area
 */
const createCroppedImage = async (
    imageSrc: string, 
    pixelCrop: Area, 
    rotation = 0,
    flipHorizontal = false,
    flipVertical = false
): Promise<Blob> => {
    const image = new Image();
    image.src = imageSrc;
    
    // Wait for image to load
    await new Promise<void>((resolve) => {
        image.onload = () => resolve();
    });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
        throw new Error('Could not get canvas context');
    }

    // Set canvas dimensions to match the cropped size
    const maxSize = Math.max(image.width, image.height);
    const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));
    
    // Set dimensions to handle rotation properly
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    
    // Move the canvas origin to the center
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipHorizontal ? -1 : 1, flipVertical ? -1 : 1);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);
    
    // Draw the image at the calculated positions
    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    );
    
    // Convert canvas to blob
    return new Promise((resolve) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                throw new Error('Canvas is empty');
            }
            resolve(blob);
        }, 'image/png', 1);
    });
};

export default function ImageCropper({ 
    visible, 
    imageSrc, 
    onCancel, 
    onCrop,
    aspectRatio = 1
}: ImageCropperProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Handle completed crop
    const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    // Process and complete crop action
    const handleCropImage = useCallback(async () => {
        if (!croppedAreaPixels) return;
        
        try {
            setIsProcessing(true);
            const croppedImage = await createCroppedImage(
                imageSrc,
                croppedAreaPixels,
                rotation
            );
            onCrop(croppedImage);
        } catch (e) {
            console.error('Error creating cropped image:', e);
        } finally {
            setIsProcessing(false);
        }
    }, [imageSrc, croppedAreaPixels, rotation, onCrop]);

    // Zoom handlers
    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 3));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 1));
    
    // Rotation handlers
    const handleRotateLeft = () => setRotation(prev => prev - 90);
    const handleRotateRight = () => setRotation(prev => prev + 90);

    return (
        <Modal
            title={<Title level={4}>Adjust and Crop Image</Title>}
            open={visible}
            onCancel={onCancel}
            width={700}
            centered
            footer={[
                <Button key="cancel" onClick={onCancel}>
                    Cancel
                </Button>,
                <Button 
                    key="crop" 
                    type="primary" 
                    onClick={handleCropImage} 
                    loading={isProcessing}
                >
                    Crop Image
                </Button>
            ]}
        >
            <div style={{ 
                position: 'relative', 
                height: 400, 
                background: '#333',
                borderRadius: '8px',
                overflow: 'hidden',
                marginBottom: '20px'
            }}>
                <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    rotation={rotation}
                    aspect={aspectRatio}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                    objectFit="contain"
                />
            </div>
            
            <Row gutter={[16, 16]} align="middle">
                <Col span={4}>
                    <Typography.Text strong>Zoom:</Typography.Text>
                </Col>
                <Col span={16}>
                    <Slider
                        min={1}
                        max={3}
                        step={0.1}
                        value={zoom}
                        onChange={setZoom}
                        tooltip={{ formatter: (value) => `${Math.round((value || 1) * 100)}%` }}
                    />
                </Col>
                <Col span={4}>
                    <Space.Compact block style={{ width: '100%' }}>
                        <Button 
                            icon={<ZoomOutOutlined />} 
                            onClick={handleZoomOut}
                            disabled={zoom <= 1}
                        />
                        <Button 
                            icon={<ZoomInOutlined />} 
                            onClick={handleZoomIn}
                            disabled={zoom >= 3}
                        />
                    </Space.Compact>
                </Col>
            </Row>
            
            <Row style={{ marginTop: '12px' }}>
                <Col span={24}>
                    <div style={{ textAlign: 'center' }}>
                        <Space.Compact block style={{ width: '100%' }}>
                            <Button 
                                icon={<RotateLeftOutlined />} 
                                onClick={handleRotateLeft}
                                title="Rotate 90° left"
                            >
                                Rotate Left
                            </Button>
                            <Button 
                                icon={<RotateRightOutlined />} 
                                onClick={handleRotateRight}
                                title="Rotate 90° right"
                            >
                                Rotate Right
                            </Button>
                        </Space.Compact>
                    </div>
                </Col>
            </Row>
        </Modal>
    );
}