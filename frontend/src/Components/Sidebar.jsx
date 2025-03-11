import React, { useState, useEffect } from 'react';
import '/src/css/Sidebar.css';

const Sidebar = ({
  sidebar,
  sidebarContent,
  handleJsonUpload,
  displayedTags,
  setDisplayedTags,
  filteredTags,
  setFilteredTags,
}) => {
  const defaultTags = ['Aeroplan', 'Car', 'Person', 'Train'];
  const [tags, setTags] = useState(defaultTags);
  const [objectDurations, setObjectDurations] = useState({}); // 🔹 Додаємо стан для аналітики

  useEffect(() => {
    if (sidebarContent && sidebarContent.video_analysis) {
      const extractedTags = new Set([...tags]);

      sidebarContent.video_analysis.forEach((frame) => {
        frame.objects.forEach((obj) => {
          extractedTags.add(obj['object-class']);
        });
      });

      const newTagsArray = Array.from(extractedTags);
      setTags(newTagsArray);

      setDisplayedTags((prevTags) => {
        const updatedDisplayedTags = new Set([...prevTags]);
        newTagsArray.forEach((tag) => updatedDisplayedTags.add(tag));
        return Array.from(updatedDisplayedTags);
      });

      // 🔹 Викликаємо розрахунок часу об'єктів
      calculateObjectDurations(sidebarContent.video_analysis);
    }
  }, [sidebarContent]);

  // 🔹 Функція підрахунку часу перебування кожного об'єкта у відео
  const calculateObjectDurations = (videoAnalysis) => {
    const durations = {};

    let activeObjects = {}; // Об'єкти, які зараз "видимі"

    for (let i = 0; i < videoAnalysis.length; i++) {
      const currentTime = videoAnalysis[i].time;
      const detectedObjects = videoAnalysis[i].objects.map(
        (obj) => obj['object-class']
      );

      // Закриваємо часові відрізки для об'єктів, які зникли
      for (const obj in activeObjects) {
        if (!detectedObjects.includes(obj)) {
          if (!durations[obj]) durations[obj] = 0;
          durations[obj] += currentTime - activeObjects[obj]; // Час (кінець - початок)
          delete activeObjects[obj]; // Видаляємо, бо об'єкт більше не в кадрі
        }
      }

      // Відзначаємо появу нових об'єктів
      detectedObjects.forEach((obj) => {
        if (!(obj in activeObjects)) {
          activeObjects[obj] = currentTime; // Початок появи
        }
      });
    }

    // Закриваємо останні відкриті відрізки часу (якщо відео закінчилося, а об'єкт ще є)
    for (const obj in activeObjects) {
      if (!durations[obj]) durations[obj] = 0;
      durations[obj] +=
        videoAnalysis[videoAnalysis.length - 1].time - activeObjects[obj];
    }

    setObjectDurations(durations);
  };

  return (
    <div className={`sidebar ${sidebar ? '' : 'hover-sidebar'}`}>
      <div className="json-report">
        <div className="sidebar-json-upload">
          <h3>
            <label>Upload JSON Report:</label>
          </h3>
          <input type="file" accept=".json" onChange={handleJsonUpload} />
        </div>
        {Object.keys(objectDurations).length > 0 && (
          <div className="object-analysis">
            <h3>Detected objects and their total time:</h3>
            <ul>
              {Object.entries(objectDurations)
                .sort((a, b) => b[1] - a[1]) // 🔥 Сортуємо за часом (від більшого до меншого)
                .map(([object, duration]) => (
                  <li key={object}>
                    {object}: {duration.toFixed(2)} сек
                  </li>
                ))}
            </ul>
          </div>
        )}

        <h3>JSON REPORT</h3>
        {sidebarContent ? (
          <pre>{JSON.stringify(sidebarContent, null, 2)}</pre>
        ) : (
          <p>No content available</p>
        )}
        <hr />
      </div>

      <div className="tags-wrapper">
        <div className="hashtags">
          <h3>Check hashtags to display</h3>
          <div className="tag-buttons">
            <button onClick={() => setDisplayedTags(tags)}>Select All</button>
            <button onClick={() => setDisplayedTags([])}>Deselect All</button>
          </div>
          <ul className="tags-list">
            {tags.map((tag, index) => (
              <li key={index} className="tag-div">
                <input
                  type="checkbox"
                  checked={displayedTags.includes(tag)}
                  onChange={() =>
                    setDisplayedTags((prevTags) =>
                      prevTags.includes(tag)
                        ? prevTags.filter((t) => t !== tag)
                        : [...prevTags, tag]
                    )
                  }
                />
                <p>{tag}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="hashtags">
          <h3>Filter hashtags to display videos</h3>
          <div className="tag-buttons">
            <button onClick={() => setFilteredTags(tags)}>Select All</button>
            <button onClick={() => setFilteredTags([])}>Deselect All</button>
          </div>
          <ul className="tags-list">
            {tags.map((tag, index) => (
              <li key={index} className="tag-div">
                <input
                  type="checkbox"
                  checked={filteredTags.includes(tag)}
                  onChange={() =>
                    setFilteredTags((prevTags) =>
                      prevTags.includes(tag)
                        ? prevTags.filter((t) => t !== tag)
                        : [...prevTags, tag]
                    )
                  }
                />
                <p>{tag}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
