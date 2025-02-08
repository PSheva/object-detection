import React, { useRef, useState, useEffect } from "react";
import "/src/css/VideoBox.css";

const VideoBox = ({ video, setSidebarContent, deleteVideo, displayedTags = [], updateRecognizedTags }) => {
  const videoRef = useRef(null);
  const [responseJson, setResponseJson] = useState(null);
  const [classTimelines, setClassTimelines] = useState({});
  const [currentFrameObjects, setCurrentFrameObjects] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (responseJson && Array.isArray(responseJson.video_analysis)) {
      generateTimelines(responseJson.video_analysis);
    }
  }, [responseJson]);

  const generateTimelines = (videoAnalysis) => {
    const timelines = {};
    videoAnalysis.forEach((frame) => {
      frame.objects.forEach((obj) => {
        const objectClass = obj["object-class"];
        if (!timelines[objectClass]) {
          timelines[objectClass] = [];
        }
        timelines[objectClass].push(frame.time);
      });
    });
    setClassTimelines(timelines);
  };

  const updateBoundingBoxes = () => {
    if (!responseJson) return;
    const currentTime = videoRef.current?.currentTime || 0;
    const frame = responseJson.video_analysis.find(
      (frame) => Math.abs(frame.time - currentTime) < 0.1
    );
    if (!frame) return;
    setCurrentFrameObjects(
      frame.objects.filter((obj) => displayedTags.includes(obj["object-class"]))
    );
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
  }, [responseJson, displayedTags]);

  const handleJsonUpload = (event) => {
    if (!event.target.files || event.target.files.length === 0) {
      alert("No file selected.");
      return;
    }
    const file = event.target.files[0];

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        if (!json || !json.video_analysis || !Array.isArray(json.video_analysis)) {
          throw new Error("Invalid JSON format. Missing 'video_analysis' key.");
        }

        console.log("✅ JSON loaded successfully:", json);
        setResponseJson(json);
        setSidebarContent(json);
        generateTimelines(json.video_analysis);

        const recognizedTags = new Set();
        json.video_analysis.forEach(frame => {
          frame.objects.forEach(obj => recognizedTags.add(obj["object-class"]));
        });

        // ✅ Передаємо recognizedTags у PlayManager
        updateRecognizedTags(Array.from(recognizedTags));

        alert("JSON report loaded successfully.");
      } catch (error) {
        console.error("❌ JSON Parse Error:", error.message);
        alert("Invalid JSON format: " + error.message);
      }
    };

    reader.readAsText(file);
  };

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
      setSidebarContent(json);
      generateTimelines(json.video_analysis);

      const recognizedTags = new Set();
        json.video_analysis.forEach(frame => {
          frame.objects.forEach(obj => recognizedTags.add(obj["object-class"]));
        });

        // ✅ Передаємо recognizedTags у PlayManager
        updateRecognizedTags(Array.from(recognizedTags));


      alert("Video processed successfully.");
    } catch (error) {
      console.error("Error uploading video:", error);
      alert("Error uploading video.");
    } finally {
      setUploading(false);
    }
  };

  // ✅ Завантаження JSON у Sidebar
  const handleShowJson = () => {
    if (responseJson) {
      setSidebarContent(responseJson);
    } else {
      alert("No JSON data available. Please process a video first.");
    }
  };

  // ✅ Завантаження JSON-звіту
  const handleDownloadJson = () => {
    if (!responseJson) {
      alert("No JSON data available to download.");
      return;
    }

    const jsonBlob = new Blob([JSON.stringify(responseJson, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(jsonBlob);
    link.download = "video-analysis-result.json";
    link.click();
  };

  return (
    <div className="video-box-container">
      <div className="video-content">
        <video ref={videoRef} controls>
          <source src={video.url || ""} type="video/mp4" />
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
        <button onClick={() => videoRef.current?.play()}>Play</button>
        <button onClick={() => videoRef.current?.pause()}>Pause</button>
        <button onClick={() => { videoRef.current.pause(); videoRef.current.currentTime = 0; }}>Stop</button>
        <button onClick={() => {
            console.log("🛑 Клік на Delete у відео:", video.url);
            if (typeof deleteVideo === "function") {
              deleteVideo(video.url);
            } else {
              console.error("❌ deleteVideo не є функцією!");
            }
          }} style={{ backgroundColor: "red" }}>
            Delete
          </button>



        <button onClick={handleSendVideo} disabled={uploading}>
          {uploading ? "Sending..." : "Send"}
        </button>
        <button onClick={handleShowJson} style={{ backgroundColor: responseJson ? "green" : "" }}>
          Show JSON
        </button>
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
                    onClick={() => videoRef.current && (videoRef.current.currentTime = time)}
                  ></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="file-upload">
        <label>
          Upload JSON Report:
          <input type="file" accept=".json" onChange={handleJsonUpload} />
        </label>
      </div>
      <button onClick={handleDownloadJson} disabled={!responseJson} style={{ backgroundColor: responseJson ? "green" : "" }}>
        Download JSON
      </button>
    </div>
  );
};

export default VideoBox;