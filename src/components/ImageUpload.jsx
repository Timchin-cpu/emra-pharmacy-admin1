import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Link as LinkIcon } from 'lucide-react'

export default function ImageUpload({ images, onChange, maxImages = 5 }) {
  const onDrop = useCallback((files) => {
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = () => onChange([...images, reader.result])
      reader.readAsDataURL(file)
    })
  }, [images, onChange])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] },
    maxFiles: maxImages - images.length,
    disabled: images.length >= maxImages,
  })

  const remove = (i) => onChange(images.filter((_, idx) => idx !== i))

  const addByUrl = () => {
    const url = prompt('Введите URL изображения:')
    if (url?.trim()) onChange([...images, url.trim()])
  }

  return (
    <div>
      {images.length < maxImages && (
        <>
          <div
            {...getRootProps()}
            className={`dropzone${isDragActive ? ' active' : ''}`}
          >
            <input {...getInputProps()} />
            <Upload />
            {isDragActive
              ? <p style={{ color: 'var(--primary)', fontWeight: 500 }}>Отпустите файлы здесь...</p>
              : (
                <>
                  <p style={{ fontWeight: 500, marginBottom: 4 }}>Перетащите изображения сюда или кликните</p>
                  <p style={{ fontSize: 12 }}>PNG, JPG, GIF до 5MB (максимум {maxImages} изображений)</p>
                </>
              )
            }
          </div>
          <button type="button" className="btn btn-outline" style={{ width: '100%', marginTop: 8 }} onClick={addByUrl}>
            <LinkIcon size={15} /> Добавить по URL
          </button>
        </>
      )}

      {images.length > 0 && (
        <>
          <div className="image-grid">
            {images.map((img, i) => (
              <div className="image-thumb" key={i}>
                <img src={img} alt={`Фото ${i + 1}`} onError={e => { e.target.src = 'https://via.placeholder.com/120?text=Error' }} />
                <button className="image-thumb-remove" type="button" onClick={() => remove(i)}><X size={12} /></button>
                {i === 0 && <span className="image-thumb-badge">Главное</span>}
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
            Первое изображение будет использоваться как главное
          </p>
        </>
      )}
    </div>
  )
}
