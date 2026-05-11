import { useState, useEffect } from 'react'
import { Upload, Trash2, FileText, AlertCircle, Loader2 } from 'lucide-react'

interface Document {
  id: string
  filename: string
  file_type: string
  size_bytes: number
  chunk_count: number
  status: 'pending' | 'indexing' | 'indexed' | 'failed'
  created_at: string
}

interface DocumentListResponse {
  total: number
  documents: Document[]
}

export function KnowledgePage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  // 加载文档列表
  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/v1/knowledge/documents')
      if (!response.ok) throw new Error('获取文档列表失败')
      const data: DocumentListResponse = await response.json()
      setDocuments(data.documents)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDocuments()
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
      setError(null)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await fetch('/api/v1/knowledge/upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.detail || '上传失败')
      }

      if (result.code !== 0) {
        // MD5 重复等业务错误
        setError(result.message || '上传失败')
      } else {
        // 上传成功，刷新列表
        await fetchDocuments()
        setSelectedFile(null)
        // 重置文件输入
        const input = document.querySelector('input[type="file"]') as HTMLInputElement
        if (input) input.value = ''
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '上传失败')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string, filename: string) => {
    if (!confirm(`确定要删除"${filename}"吗？删除后将无法恢复。`)) return

    try {
      const response = await fetch(`/api/v1/knowledge/documents/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('删除失败')

      // 刷新列表
      await fetchDocuments()
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: Document['status']) => {
    const styles = {
      pending: 'bg-gray-500/20 text-gray-400',
      indexing: 'bg-blue-500/20 text-blue-400',
      indexed: 'bg-green-500/20 text-green-400',
      failed: 'bg-red-500/20 text-red-400'
    }
    const labels = {
      pending: '待处理',
      indexing: '索引中',
      indexed: '已索引',
      failed: '失败'
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${styles[status]}`}>
        {labels[status]}
      </span>
    )
  }

  const totalChunks = documents.reduce((sum, doc) => sum + doc.chunk_count, 0)
  const indexedDocs = documents.filter(doc => doc.status === 'indexed').length

  return (
    <div className="min-h-screen dark:bg-dark-bg light:bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* 头部 */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold dark:text-white light:text-gray-900 mb-2">
              知识库管理
            </h1>
            <p className="dark:text-gray-400 light:text-gray-600">
              上传、管理和删除知识库文档
            </p>
          </div>
          <a
            href="/"
            className="px-4 py-2 rounded-lg dark:bg-dark-card light:bg-white border dark:border-dark-border light:border-gray-200 dark:text-gray-300 light:text-gray-700 hover:opacity-80 transition-opacity text-center sm:text-left whitespace-nowrap"
          >
            返回聊天
          </a>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-300 text-sm"
            >
              关闭
            </button>
          </div>
        )}

        {/* 上传区域 */}
        <div className="dark:bg-dark-card light:bg-white rounded-xl p-6 border dark:border-dark-border light:border-gray-200 mb-6">
          <h2 className="text-lg font-medium dark:text-white light:text-gray-900 mb-4">
            上传文档
          </h2>
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept=".txt,.pdf,.md"
              onChange={handleFileSelect}
              disabled={uploading}
              className="flex-1 text-sm dark:text-gray-300 light:text-gray-700
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-medium
                file:gradient-bg file:text-white
                file:cursor-pointer file:hover:opacity-90
                disabled:opacity-50"
            />
            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="px-6 py-2 rounded-lg gradient-bg text-white font-medium
                hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed
                flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  上传中...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  上传
                </>
              )}
            </button>
          </div>
          <p className="text-xs dark:text-gray-500 light:text-gray-400 mt-2">
            支持格式：TXT、PDF、Markdown，单文件最大 50MB
          </p>
        </div>

        {/* 统计信息 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="dark:bg-dark-card light:bg-white rounded-xl p-4 border dark:border-dark-border light:border-gray-200">
            <div className="text-sm dark:text-gray-400 light:text-gray-600 mb-1">总文档数</div>
            <div className="text-2xl font-semibold dark:text-white light:text-gray-900">
              {documents.length}
            </div>
          </div>
          <div className="dark:bg-dark-card light:bg-white rounded-xl p-4 border dark:border-dark-border light:border-gray-200">
            <div className="text-sm dark:text-gray-400 light:text-gray-600 mb-1">已索引</div>
            <div className="text-2xl font-semibold dark:text-white light:text-gray-900">
              {indexedDocs}
            </div>
          </div>
          <div className="dark:bg-dark-card light:bg-white rounded-xl p-4 border dark:border-dark-border light:border-gray-200">
            <div className="text-sm dark:text-gray-400 light:text-gray-600 mb-1">总分块数</div>
            <div className="text-2xl font-semibold dark:text-white light:text-gray-900">
              {totalChunks}
            </div>
          </div>
        </div>

        {/* 文档列表 */}
        <div className="dark:bg-dark-card light:bg-white rounded-xl border dark:border-dark-border light:border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b dark:border-dark-border light:border-gray-200">
            <h2 className="text-lg font-medium dark:text-white light:text-gray-900">
              文档列表
            </h2>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto dark:text-gray-500 light:text-gray-400 mb-3" />
              <p className="dark:text-gray-400 light:text-gray-500">加载中...</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 mx-auto dark:text-gray-600 light:text-gray-400 mb-3" />
              <p className="dark:text-gray-400 light:text-gray-500">暂无文档，请上传文档</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="dark:bg-dark-bg light:bg-gray-50 border-b dark:border-dark-border light:border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium dark:text-gray-400 light:text-gray-600 uppercase tracking-wider">
                    文件名
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium dark:text-gray-400 light:text-gray-600 uppercase tracking-wider">
                    类型
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium dark:text-gray-400 light:text-gray-600 uppercase tracking-wider">
                    大小
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium dark:text-gray-400 light:text-gray-600 uppercase tracking-wider">
                    分块数
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium dark:text-gray-400 light:text-gray-600 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium dark:text-gray-400 light:text-gray-600 uppercase tracking-wider">
                    上传时间
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-medium dark:text-gray-400 light:text-gray-600 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-dark-border light:divide-gray-200">
                {documents.map((doc) => (
                  <tr key={doc.id} className="dark:hover:bg-dark-bg light:hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 dark:text-gray-400 light:text-gray-500 flex-shrink-0" />
                        <span className="text-sm dark:text-white light:text-gray-900 truncate max-w-xs">
                          {doc.filename}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm dark:text-gray-400 light:text-gray-600 uppercase">
                      {doc.file_type}
                    </td>
                    <td className="px-6 py-4 text-sm dark:text-gray-400 light:text-gray-600">
                      {formatFileSize(doc.size_bytes)}
                    </td>
                    <td className="px-6 py-4 text-sm dark:text-gray-400 light:text-gray-600">
                      {doc.chunk_count}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(doc.status)}
                    </td>
                    <td className="px-6 py-4 text-sm dark:text-gray-400 light:text-gray-600">
                      {formatDate(doc.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(doc.id, doc.filename)}
                        className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
