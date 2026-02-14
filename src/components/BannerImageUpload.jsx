import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Link as LinkIcon } from 'lucide-react'

export default function BannerImageUpload({ image, onChange }) {
  const onDrop = useCallback((files) => {
    if (files[0]) {
      const reader = new FileReader()
      reader.onload = () => onChange(reader.result)
      reader.readAsDataURL(files[0])
    }
  }, [onChange])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] },
    maxFiles: 1,
  })

  const addByUrl = () => {
    const url = prompt('Введите URL изображения баннера:')
    if (url?.trim()) onChange(url.trim())
  }

  if (image) {
    return (
      <div>
        <div style={{ position: 'relative', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border)' }}>
          <img
            src={image}
            alt="Banner preview"
            style={{ width: '100%', maxHeight: 240, objectFit: 'cover', display: 'block' }}
            onError={e => { e.target.src = 'https://via.placeholder.com/1200x400?text=Error' }}
          />
          <button
            type="button"
            onClick={() => onChange('')}
            style={{
              position: 'absolute', top: 10, right: 10,
              background: 'rgba(0,0,0,0.65)', color: 'white',
              border: 'none', borderRadius: 6, padding: '6px 12px',
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 13, cursor: 'pointer',
            }}
          >
            <X size={14} /> Удалить
          </button>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => onChange('')}>
            <Upload size={14} /> Изменить
          </button>
          <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={addByUrl}>
            <LinkIcon size={14} /> По URL
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div
        {...getRootProps()}
        className={`dropzone${isDragActive ? ' active' : ''}`}
        style={{ padding: '48px 24px' }}
      >
        <input {...getInputProps()} />
        <Upload />
        {isDragActive
          ? <p style={{ color: 'var(--primary)', fontWeight: 500 }}>Отпустите изображение здесь...</p>
          : (
            <>
              <p style={{ fontWeight: 500, marginBottom: 6 }}>Перетащите изображение баннера сюда</p>
              <p style={{ fontSize: 12 }}>или кликните для выбора файла</p>
              <p style={{ fontSize: 11, marginTop: 4, color: 'var(--text-light)' }}>
                PNG, JPG, GIF до 10MB • Рекомендуется 1200×400
              </p>
            </>
          )
        }
      </div>
      <button type="button" className="btn btn-outline" style={{ width: '100%', marginTop: 8 }} onClick={addByUrl}>
        <LinkIcon size={14} /> Или добавить по URL
      </button>
    </div>
  )
}
