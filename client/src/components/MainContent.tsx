import { useState } from "react";
import {
  Layout,
  Button,
  Input,
  message,
  Typography,
  Upload,
  Card,
  Popconfirm,
  Spin,
} from "antd";
import {
  UploadOutlined,
  PictureOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { UploadFile, UploadProps } from "antd/es/upload/interface";
import type { RcFile } from "antd/es/upload";
import { imageService, ImageData } from "../api/image-service";
import { toast } from "sonner";

const { Content } = Layout;
const { Title, Text } = Typography;
const { Dragger } = Upload;

interface MainContentProps {
  images: ImageData[];
  setImages: React.Dispatch<React.SetStateAction<ImageData[]>>;
  showEditImageModal: (image: ImageData) => void;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

// Sortable Image Item Component
const SortableImage = ({
  image,
  showEditImageModal,
  handleDeleteImage,
}: {
  image: ImageData;
  showEditImageModal: (image: ImageData) => void;
  handleDeleteImage: (id: string) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: image._id,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: transform ? 1 : 0, // Lift the dragged item
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card
        hoverable
        cover={
          <div style={{ height: 200, overflow: "hidden" }}>
            <img
              alt={image.title}
              src={
                `${import.meta.env.VITE_API_URL}${image.imageURL}` ||
                "/placeholder.svg"
              }
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>
        }
        actions={[
          <EditOutlined key="edit" onClick={() => showEditImageModal(image)} />,
          <Popconfirm
            key={`popconfirm-${image._id}`}
            title="Delete this image?"
            description="Are you sure you want to delete this image?"
            onConfirm={() => handleDeleteImage(image._id)}
            okText="Yes"
            cancelText="No"
          >
            <DeleteOutlined key="delete" />
          </Popconfirm>,
        ]}
      >
        <Card.Meta title={image.title} />
      </Card>
    </div>
  );
};

export const MainContent = ({
  images,
  setImages,
  showEditImageModal,
  loading,
  setLoading,
}: MainContentProps) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadTitles, setUploadTitles] = useState<Record<string, string>>({});

  const handleUpload = async () => {
    if (fileList.length === 0) {
      toast.error("Please select at least one file to upload");
      return;
    }

    const missingTitles = fileList.filter((file) => !uploadTitles[file.uid]);
    if (missingTitles.length > 0) {
      toast.error("Please provide titles for all images");
      return;
    }

    setUploading(true);

    try {
      const files: File[] = [];
      for (const file of fileList) {
        if (!file.originFileObj) {
          console.error(`Missing originFileObj for file: ${file.name}`);
          toast.error(
            `Problem with file: ${file.name}. Please try uploading again.`
          );
          setUploading(false);
          return;
        }
        files.push(file.originFileObj);
      }

      const titlesRecord: Record<string, string> = {};
      fileList.forEach((file, index) => {
        titlesRecord[index.toString()] = uploadTitles[file.uid];
      });

      await imageService.uploadImages(files, titlesRecord);

      message.success(`${fileList.length} file(s) uploaded successfully.`);
      setFileList([]);
      setUploadTitles({});

      setLoading(true);
      const updatedImages = await imageService.getImages();
      setImages(updatedImages);
    } catch (error) {
      message.error("Upload failed");
      console.error(error);
    } finally {
      setUploading(false);
      setLoading(false);
    }
  };

  const beforeUpload = (file: RcFile) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error(`${file.name} is not an image file`);
      return Upload.LIST_IGNORE;
    }

    const uploadFile: UploadFile = {
      uid: file.uid,
      name: file.name,
      status: "done",
      size: file.size,
      type: file.type,
      percent: 100,
      originFileObj: file,
    };

    setFileList((prev) => [...prev, uploadFile]);
    return false;
  };

  const uploadProps: UploadProps = {
    onRemove: (file) => {
      const newFileList = fileList.filter((item) => item.uid !== file.uid);
      setFileList(newFileList);

      const newUploadTitles = { ...uploadTitles };
      delete newUploadTitles[file.uid];
      setUploadTitles(newUploadTitles);
    },
    beforeUpload,
    fileList,
    multiple: true,
    listType: "picture",
    accept: "image/*",
  };

  const handleTitleChange = (uid: string, title: string) => {
    setUploadTitles((prev) => ({
      ...prev,
      [uid]: title,
    }));
  };

  const handleDeleteImage = async (id: string) => {
    try {
      setLoading(true);
      await imageService.deleteImage(id);

      const updatedImages = images.filter((img) => img._id !== id);
      setImages(updatedImages);
      message.success("Image deleted successfully");
    } catch (error) {
      message.error("Failed to delete image");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = images.findIndex((img) => img._id === active.id);
    const newIndex = images.findIndex((img) => img._id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      console.error("Invalid drag indices:", { oldIndex, newIndex });
      return;
    }

    // Reorder the images array
    const newImages = arrayMove(images, oldIndex, newIndex);

    // Update the order property
    const updatedImages = newImages.map((item, index) => ({
      ...item,
      order: index,
    }));

    setImages(updatedImages);
  };

  const saveImageOrder = async () => {
    try {
      setLoading(true);
      const imageOrder = images.map((img, index) => ({
        _id: img._id,
        order: index,
      }));
      console.log("Sending imageOrder:", imageOrder);
      await imageService.updateImageOrder(imageOrder);
      message.success("Image order saved successfully");
    } catch (error) {
      message.error("Failed to save image order");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Content
      style={{
        margin: "24px 16px",
        padding: 24,
        background: "#fff",
        minHeight: 280,
      }}
    >
      <Card title="Upload Images" style={{ marginBottom: 24 }}>
        <Dragger {...uploadProps} style={{ marginBottom: 16 }}>
          <p className="ant-upload-drag-icon">
            <UploadOutlined />
          </p>
          <p className="ant-upload-text">
            Click or drag files to this area to upload
          </p>
          <p className="ant-upload-hint">
            Support for bulk upload. Please provide a title for each image.
          </p>
        </Dragger>

        {fileList.length > 0 && (
          <div style={{ marginTop: 16, marginBottom: 16 }}>
            <Title level={5}>Image Titles</Title>
            {fileList.map((file) => (
              <div
                key={file.uid}
                style={{
                  display: "flex",
                  marginBottom: 8,
                  alignItems: "center",
                }}
              >
                <Text ellipsis style={{ width: 200 }}>
                  {file.name}
                </Text>
                <Input
                  placeholder="Enter title for this image"
                  value={uploadTitles[file.uid] || ""}
                  onChange={(e) => handleTitleChange(file.uid, e.target.value)}
                  style={{ marginLeft: 16, flex: 1 }}
                />
              </div>
            ))}
          </div>
        )}

        <Button
          type="primary"
          onClick={handleUpload}
          disabled={fileList.length === 0}
          loading={uploading}
          style={{ marginTop: 16 }}
        >
          {uploading ? "Uploading" : "Start Upload"}
        </Button>
      </Card>

      <Card
        title="My Images"
        extra={
          images.length > 0 && (
            <Button type="primary" onClick={saveImageOrder}>
              Save Order
            </Button>
          )
        }
      >
        {loading ? (
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <Spin size="large" />
          </div>
        ) : images.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <PictureOutlined style={{ fontSize: 48, color: "#ccc" }} />
            <p>No images uploaded yet</p>
          </div>
        ) : (
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={images.map((image) => image._id)}
              strategy={verticalListSortingStrategy} // Adjust strategy if needed
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                  gap: "16px",
                  minHeight: "50px",
                }}
              >
                {images.map((image) => (
                  <SortableImage
                    key={image._id}
                    image={image}
                    showEditImageModal={showEditImageModal}
                    handleDeleteImage={handleDeleteImage}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </Card>
    </Content>
  );
};
