import { useState, useCallback } from 'react'
import { Container, Row, Col, Card, Alert, Table, Button } from 'react-bootstrap'
import { useDropzone } from 'react-dropzone'
import * as XLSX from 'xlsx'
import { dreSupabaseService } from '../services/dreSupabaseService'
import { useNavigate } from 'react-router-dom'

interface FileData {
  name: string
  size: number
  type: string
  lastModified: number
  preview?: any[]
  data?: any[]
}

const Upload = () => {
  const navigate = useNavigate()
  const [files, setFiles] = useState<FileData[]>([])
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  const [preview, setPreview] = useState<any[]>([])
  const [isImporting, setIsImporting] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError('')
    setSuccess('')

    acceptedFiles.forEach((file) => {
      const reader = new FileReader()

      reader.onabort = () => setError('A leitura do arquivo foi abortada')
      reader.onerror = () => setError('Ocorreu um erro na leitura do arquivo')

      reader.onload = (e) => {
        try {
          if (!e.target || !e.target.result) {
            throw new Error('Erro ao ler conteúdo do arquivo')
          }

          const data = e.target.result
          const workbook = XLSX.read(data, { type: 'array' })
          
          if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
            throw new Error('Planilha vazia ou inválida')
          }

          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]

          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            defval: null,
            raw: false
          })
          
          if (!jsonData || jsonData.length === 0) {
            throw new Error('Não foram encontrados dados na planilha')
          }

          console.log('[Upload.tsx] Primeira linha lida (após raw:false):', jsonData[0])
          console.log('[Upload.tsx] Campos disponíveis:', jsonData[0] ? Object.keys(jsonData[0] as Record<string, unknown>) : [])

          const previewData = jsonData.slice(0, 5)

          setFiles([{
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified,
            preview: previewData,
            data: jsonData
          }])

          setPreview(previewData)
        } catch (err) {
          console.error('Erro ao processar arquivo:', err)
          setError(`Erro ao processar o arquivo: ${err instanceof Error ? err.message : String(err)}. Verifique o formato.`)
        }
      }

      reader.readAsArrayBuffer(file)
    })
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv']
    },
    maxFiles: 1
  })

  const handleImportData = async () => {
    if (files.length === 0 || !files[0].data) {
      setError('Nenhum arquivo para importar')
      return
    }

    try {
      setIsImporting(true)
      setError('')
      
      // Garantir que a tabela existe
      await dreSupabaseService.createTableIfNotExists()
      
      // Importar dados para o Supabase
      const result = await dreSupabaseService.importExcelData(files[0].data, files[0].name)
      
      if (result.success) {
        setSuccess(`✅ ${result.count} registros importados com sucesso para o Supabase! Batch ID: ${result.batchId}`)
        
        // Limpar o formulário após importação bem-sucedida
        setFiles([])
        setPreview([])

        // Redirecionar para o dashboard após 3 segundos
        setTimeout(() => {
          navigate('/dashboard')
        }, 3000)
      } else {
        setError(`❌ Erro na importação: ${result.errors?.join(', ') || 'Erro desconhecido'}`)
      }
      
    } catch (err) {
      console.error('Erro ao importar dados:', err)
      setError(`❌ Erro ao importar os dados: ${err instanceof Error ? err.message : 'Erro desconhecido'}. Verifique o formato do arquivo.`)
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h1>📊 Upload de Dados DRE</h1>
          <p className="text-muted">
            Importe planilhas Excel (.xlsx, .xls) ou CSV com dados financeiros DRE. 
            Os dados serão processados e armazenados no Supabase para análise em toda a aplicação.
          </p>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" onClose={() => setError('')} dismissible>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" onClose={() => setSuccess('')} dismissible>
          {success}
        </Alert>
      )}

      <Row>
        <Col>
          <Card className="mb-4">
            <Card.Body>
              <div
                {...getRootProps()}
                className={`dropzone ${isDragActive ? 'active' : ''}`}
              >
                <input {...getInputProps()} />
                {isDragActive ? (
                  <p>Solte o arquivo aqui ...</p>
                ) : (
                  <div className="text-center py-4">
                    <div className="mb-3">
                      <i className="fas fa-cloud-upload-alt fa-3x text-primary mb-3"></i>
                    </div>
                    <h4>📁 Arraste e solte um arquivo aqui</h4>
                    <p className="text-muted">
                      ou <strong>clique para selecionar</strong><br/>
                      Formatos aceitos: .xlsx, .xls, .csv<br/>
                      <small>Os dados serão enviados diretamente para o Supabase</small>
                    </p>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {files.length > 0 && preview.length > 0 && (
        <>
          <Row className="mb-3">
            <Col>
              <h3>👀 Preview dos Dados</h3>
              <p className="text-muted">
                Mostrando as primeiras 5 linhas do arquivo. 
                <strong>Arquivo:</strong> {files[0].name} ({Math.round(files[0].size / 1024)} KB)
              </p>
              <div className="alert alert-info">
                <strong>ℹ️ Informação:</strong> Apenas registros com status "Realizado" serão importados. 
                A tabela DRE-HITSS será limpa antes da importação de novos dados.
              </div>
            </Col>
          </Row>

          <Row className="mb-4">
            <Col>
              <div className="table-responsive">
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      {Object.keys(preview[0]).map((header) => (
                        <th key={header}>{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, index) => (
                      <tr key={index}>
                        {Object.values(row).map((value: any, i) => (
                          <td key={i}>{value}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Col>
          </Row>

          <Row>
            <Col className="text-center">
              <Button
                variant="primary"
                size="lg"
                onClick={handleImportData}
                disabled={isImporting}
                className="px-5"
              >
                {isImporting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Importando para Supabase...
                  </>
                ) : (
                  <>
                    🚀 Importar Dados para Supabase
                  </>
                )}
              </Button>
            </Col>
          </Row>
        </>
      )}
    </Container>
  )
}

export default Upload
