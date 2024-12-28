import React, { useRef, useState, useEffect } from "react";
import "/src/css/VideoBox.css";

const VideoBox = ({ video, setSidebarContent, deleteVideo, filterTags }) => {
  const videoRef = useRef(null);
  const [classTimelines, setClassTimelines] = useState({});
  const [currentFrameObjects, setCurrentFrameObjects] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [responseJson, setResponseJson] = useState(null);

  useEffect(() => {
    if (responseJson && Array.isArray(responseJson.video_analysis)) {
      generateTimelines(responseJson.video_analysis);
    }
  }, [responseJson, filterTags]);

  const generateTimelines = (videoAnalysis) => {
    const timelines = {};
    videoAnalysis.forEach((frame) => {
      frame.objects.forEach((obj) => {
        const objectClass = obj["object-class"];
        if (!filterTags || filterTags.includes(objectClass)) {
          if (!timelines[objectClass]) {
            timelines[objectClass] = [];
          }
          timelines[objectClass].push(frame.time);
        }
      });
    });
    setClassTimelines(timelines);
  };

  const playVideo = () => {
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  const pauseVideo = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const stopVideo = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const handleTimelineClick = (time) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const updateBoundingBoxes = () => {
    if (responseJson) {
      const currentTime = videoRef.current?.currentTime || 0;
      const frame = responseJson.video_analysis.find(
        (frame) => Math.abs(frame.time - currentTime) < 0.1
      );
      setCurrentFrameObjects(frame?.objects || []);
    }
  };

  useEffect(() => {
    const videoElement = videoRef.current;

    if (videoElement) {
      videoElement.addEventListener("timeupdate", updateBoundingBoxes);
    }

    return () => {
      if (videoElement) {
        videoElement.removeEventListener("timeupdate", updateBoundingBoxes);
      }
    };
  }, [responseJson]);

  const handleSendVideo = async () => {
    if (!video.file) {
      alert("No video file selected.");
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("file", video.file);

    try {
      const response = await fetch("http://localhost:8000/upload-video/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload video");
      }

      const json = await response.json();
      setResponseJson(json);
      alert("Video processed successfully.");
    } catch (error) {
      console.error("Error uploading video:", error);
      alert("Error uploading video.");
    } finally {
      setUploading(false);
    }
  };

  const handleJsonUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target.result);
          if (Array.isArray(json)) {
            setResponseJson({ video_analysis: json });
            generateTimelines(json);
            alert("JSON report loaded successfully.");
          } else {
            alert("Invalid JSON format. Please provide a valid video analysis JSON.");
          }
        } catch (error) {
          alert("Error parsing JSON: " + error.message);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleShowJson = () => {
    if (responseJson) {
      setSidebarContent(responseJson);
    } else {
      alert("No JSON data available. Please process a video first.");
    }
  };

  return (
    <div className="video-box-container">
      <div className="video-content">
        <video ref={videoRef} controls>
          <source src={video.url || ""} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="overlay">
          {currentFrameObjects.map((obj, index) => (
            <div
              key={index}
              className="bounding-box"
              style={{
                left: `${obj.frame_coordinates[0] * 100}%`,
                top: `${obj.frame_coordinates[1] * 100}%`,
                width: `${(obj.frame_coordinates[2] - obj.frame_coordinates[0]) * 100}%`,
                height: `${(obj.frame_coordinates[3] - obj.frame_coordinates[1]) * 100}%`,
              }}
            >
              {obj["object-class"]}
            </div>
          ))}
        </div>
      </div>
      <div className="video-controls">
        <button onClick={playVideo}>Play</button>
        <button onClick={pauseVideo}>Pause</button>
        <button onClick={stopVideo}>Stop</button>
        <button onClick={deleteVideo}>Delete</button>
        <button onClick={handleSendVideo} disabled={uploading}>
          {uploading ? "Sending..." : "Send"}
        </button>
        <button onClick={handleShowJson}>Show JSON</button>
      </div>
      {responseJson && Object.keys(classTimelines).length > 0 && (
        <div className="timelines">
          {Object.entries(classTimelines).map(([objectClass, times], index) => (
            <div key={index} className="timeline-container">
              <h4>{objectClass}</h4>
              <div className="timeline">
                {times.map((time, idx) => (
                  <div
                    key={idx}
                    className="timeline-marker"
                    style={{
                      left: `${(time / (videoRef.current?.duration || 1)) * 100}%`,
                    }}
                    onClick={() => handleTimelineClick(time)}
                  ></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="file-upload">
        <label>
          Upload Video or JSON Report:
          <input
            type="file"
            accept=".mp4,.json"
            onChange={(event) => {
              const file = event.target.files[0];
              if (file) {
                if (file.type === "application/json" || file.name.endsWith(".json")) {
                  handleJsonUpload(event);
                } else if (file.type === "video/mp4" || file.name.endsWith(".mp4")) {
                  video.file = file;
                  video.url = URL.createObjectURL(file);
                } else {
                  alert("Unsupported file type. Please upload a .mp4 or .json file.");
                }
              }
            }}
          />
        </label>
      </div>
    </div>
  );
};

export default VideoBox;
