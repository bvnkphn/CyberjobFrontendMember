import { useRef, useState, type ChangeEvent, type DragEvent, type FormEvent } from "react";

type CertificateFormProps = {
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  saved: boolean;
  initialData?: Record<string, unknown>;
};

type CertificateFile = { id: number; fileName: string; fileSize: number; fileType: string; title: string };

const acceptedTypes = ["application/pdf", "image/jpeg", "image/png"];
const maxFileSize = 10 * 1024 * 1024;

export function CertificateForm({ onSubmit, saved, initialData = {} }: CertificateFormProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const nextId = useRef(0);
  const [files, setFiles] = useState<CertificateFile[]>(() => [1, 2, 3, 4, 5]
    .filter((index) => initialData[`certificate${index}FileName`])
    .map((index) => ({ id: nextId.current++, title: String(initialData[`certificate${index}Title`] ?? ""), fileName: String(initialData[`certificate${index}FileName`] ?? ""), fileSize: Number(initialData[`certificate${index}FileSize`] ?? 0), fileType: String(initialData[`certificate${index}FileType`] ?? "") })));
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);

  const addFiles = (selectedFiles: FileList | File[]) => {
    const candidates = Array.from(selectedFiles);
    const invalid = candidates.find((file) => !acceptedTypes.includes(file.type) || file.size > maxFileSize);
    if (invalid) {
      setError("รองรับเฉพาะไฟล์ PDF, JPG, PNG และขนาดไม่เกิน 10 MB");
      return;
    }

    setError("");
    setFiles((current) => [
      ...current,
      ...candidates.map((file) => ({ id: nextId.current++, fileName: file.name, fileSize: file.size, fileType: file.type, title: file.name.replace(/\.[^.]+$/, "") })),
    ]);
  };

  const selectFiles = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) addFiles(event.target.files);
    event.target.value = "";
  };

  const dropFiles = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    addFiles(event.dataTransfer.files);
  };

  const updateTitle = (id: number, title: string) => {
    setFiles((current) => current.map((item) => item.id === id ? { ...item, title } : item));
  };

  const removeFile = (id: number) => setFiles((current) => current.filter((item) => item.id !== id));

  return (
    <form className="certificate-form" onSubmit={onSubmit}>
      <h1>ประกาศนียบัตร/วุฒิบัตร <b aria-hidden="true">*</b></h1>
      <input ref={inputRef} className="visually-hidden" type="file" accept=".pdf,.jpg,.jpeg,.png" multiple onChange={selectFiles} />

      <div
        className={`certificate-dropzone ${dragging ? "dragging" : ""}`}
        onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => setDragging(false)}
        onDrop={dropFiles}
      >
        <div className="upload-icon" aria-hidden="true">↥</div>
        <strong>ลากและวางไฟล์ที่นี่ หรือคลิกเพื่อเลือกไฟล์</strong>
        <small>รองรับไฟล์ PDF, JPG, PNG ขนาดสูงสุด 10 MB</small>
        <button type="button" onClick={() => inputRef.current?.click()}>เลือกไฟล์</button>
      </div>

      {error && <p className="certificate-error" role="alert">{error}</p>}

      <section className="certificate-list" aria-live="polite">
        <h2>ไฟล์ Certificate ทั้งหมด <span>{files.length} รายการ</span></h2>
        {files.length === 0 ? (
          <p className="certificate-empty">ยังไม่มีไฟล์ประกาศนียบัตร</p>
        ) : files.map((item, index) => (
          <div className="certificate-item" key={item.id}>
            <label>
              <span className="visually-hidden">ชื่อประกาศนียบัตรลำดับที่ {index + 1}</span>
              <input name={`certificate${index + 1}Title`} value={item.title} onChange={(event) => updateTitle(item.id, event.target.value)} placeholder="ชื่อประกาศนียบัตร" required />
            </label>
            <input type="hidden" name={`certificate${index + 1}FileName`} value={item.fileName} />
            <input type="hidden" name={`certificate${index + 1}FileSize`} value={item.fileSize} />
            <input type="hidden" name={`certificate${index + 1}FileType`} value={item.fileType} />
            <span className="certificate-file-name"><i aria-hidden="true">▤</i>{item.fileName}</span>
            <button type="button" onClick={() => removeFile(item.id)} aria-label={`ลบไฟล์ ${item.fileName}`}>ลบ</button>
          </div>
        ))}
      </section>

      <div className="save-row certificate-save-row">
        <button className="primary-button save-button" type="submit" disabled={files.length === 0}>บันทึก</button>
        {saved && <p className="save-message" role="status">บันทึกตัวอย่างเรียบร้อยแล้ว</p>}
      </div>
    </form>
  );
}
