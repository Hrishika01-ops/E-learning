import React, { useState } from "react";

interface ContentItem {
  type: string;
  title: string;
  file?: string;
}

interface CurriculumSection {
  title: string;
  items: ContentItem[];
}

interface CourseData {
  curriculum: CurriculumSection[];
}

interface CurriculumBuilderProps {
  courseData: CourseData;
  setCourseData: React.Dispatch<React.SetStateAction<CourseData>>;
}

const CurriculumBuilder: React.FC<CurriculumBuilderProps> = ({ courseData, setCourseData }) => {
  const [sectionTitle, setSectionTitle] = useState<string>("");
  const [contentTitle, setContentTitle] = useState<string>("");
  const [contentType, setContentType] = useState<string>("Lecture");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const addSection = () => {
    if (sectionTitle.trim()) {
      const updated = [...courseData.curriculum, { title: sectionTitle, items: [] }];
      setCourseData({ ...courseData, curriculum: updated });
      setSectionTitle("");
    }
  };

  const addContentToSection = (sectionIndex: number) => {
    if (contentTitle.trim()) {
      const updatedCurriculum = [...courseData.curriculum];
      updatedCurriculum[sectionIndex].items.push({
        type: contentType,
        title: contentTitle,
        file: selectedFile ? selectedFile.name : undefined,
      });
      setCourseData({ ...courseData, curriculum: updatedCurriculum });
      setContentTitle("");
      setSelectedFile(null);
    }
  };

  return (
    <div className="card p-3 mb-4">
      <h4>Curriculum</h4>

      <input
        className="form-control mb-2"
        placeholder="Section Title"
        value={sectionTitle}
        onChange={(e) => setSectionTitle(e.target.value)}
      />
      <button className="btn btn-secondary mb-3" onClick={addSection}>
        Add Section
      </button>

      {courseData.curriculum.map((section, idx) => (
        <div key={idx} className="mb-4 p-3 border rounded bg-light">
          <h5>{section.title}</h5>
          <ul>
            {section.items.map((item, itemIdx) => (
              <li key={itemIdx}>
                {item.type}: {item.title} {item.file && <em>({item.file})</em>}
              </li>
            ))}
          </ul>

          <div className="mt-3">
            <select
              className="form-select mb-2"
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
            >
              <option>Lecture</option>
              <option>Quiz</option>
              <option>Exercise</option>
              <option>Video</option>
              <option>Assignment</option>
              <option>Practice Test</option>
              <option>Role Play</option>
            </select>
            <input
              className="form-control mb-2"
              placeholder="Content Title"
              value={contentTitle}
              onChange={(e) => setContentTitle(e.target.value)}
            />
            <input
              type="file"
              className="form-control mb-2"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />
            <button
              className="btn btn-outline-primary"
              onClick={() => addContentToSection(idx)}
            >
              Add Content
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CurriculumBuilder;
