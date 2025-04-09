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
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import type { UploadFile, UploadProps } from "antd/es/upload/interface";
import type { RcFile } from "antd/es/upload";
import { imageService, ImageData } from "../api/image-service";

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

  // Image upload handlers
  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.error("Please select at least one file to upload");
      return;
    }

    // Check if all files have titles
    const missingTitles = fileList.filter((file) => !uploadTitles[file.uid]);
    if (missingTitles.length > 0) {
      message.error("Please provide titles for all images");
      return;
    }

    setUploading(true);

    try {
      const files = fileList.map((file) => file.originFileObj as File);

      // Prepare titles in the format needed by the backend
      const titleArray: string[] = [];
      fileList.forEach((file) => {
        titleArray.push(uploadTitles[file.uid]);
      });

      // Create a record of titles by index
      const titlesRecord: Record<string, string> = {};
      titleArray.forEach((title, index) => {
        titlesRecord[index.toString()] = title;
      });

      await imageService.uploadImages(files, titlesRecord);

      message.success(`${fileList.length} file(s) uploaded successfully.`);
      setFileList([]);
      setUploadTitles({});

      // Refresh the images list
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

  const uploadProps: UploadProps = {
    onRemove: (file) => {
      const newFileList = fileList.filter((item) => item.uid !== file.uid);
      setFileList(newFileList);

      // Remove title for this file
      const newUploadTitles = { ...uploadTitles };
      delete newUploadTitles[file.uid];
      setUploadTitles(newUploadTitles);
    },
    beforeUpload: (file: RcFile) => {
      // Check if file is an image
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        message.error(`${file.name} is not an image file`);
        return Upload.LIST_IGNORE;
      }

      // Add file to fileList
      setFileList((prev) => [...prev, file]);

      // Return false to prevent auto upload
      return false;
    },
    fileList,
    multiple: true,
    listType: "picture",
    accept: "image/*",
  };

  // Handle title input for each file
  const handleTitleChange = (uid: string, title: string) => {
    setUploadTitles((prev) => ({
      ...prev,
      [uid]: title,
    }));
  };

  // Image delete handler
  const handleDeleteImage = async (id: string) => {
    try {
      setLoading(true);
      await imageService.deleteImage(id);

      // Update local state after deletion
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

  // Drag and drop handler
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(images);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order property
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index,
    }));

    setImages(updatedItems);
  };

  const saveImageOrder = async () => {
    try {
      setLoading(true);
      // Prepare data for API request
      const imageOrder = images.map((img, index) => ({
        _id: img._id,
        order: index,
      }));

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
      {/* Image Upload Section */}
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

        {/* Title inputs for each file */}
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

      {/* Image Gallery Section */}
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
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="images" direction="horizontal">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(250px, 1fr))",
                    gap: "16px",
                  }}
                >
                  {images.length > 0 &&
                    Array.isArray(images) &&
                    images.map((image, index) => (
                      <Draggable
                        key={image._id}
                        draggableId={image._id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <Card
                              hoverable
                              cover={
                                <div
                                  style={{ height: 200, overflow: "hidden" }}
                                >
                                  <img
                                    alt={image.title}
                                    src={image.url || "/placeholder.svg"}
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                    }}
                                  />
                                </div>
                              }
                              actions={[
                                <EditOutlined
                                  key="edit"
                                  onClick={() => showEditImageModal(image)}
                                />,
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
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </Card>
    </Content>
  );
};
