'use client'

import { useState } from 'react'

export default function DashboardPage() {
  const [excelData, setExcelData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [fromEmail, setFromEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [text, setText] = useState('')
  const [mailStatus, setMailStatus] = useState('')
  const [perEmailStatus, setPerEmailStatus] = useState<
    { email: string; status: string }[]
  >([])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    setLoading(true)
    try {
      const res = await fetch('http://localhost:8101/api/upload', {
        method: 'POST',
        body: formData,
      })

      const json = await res.json()
      setExcelData(json)
    } catch (err) {
      console.error('Upload failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSendMail = async () => {
    if (!fromEmail || !subject || !text) {
      setMailStatus('❌ Please fill in all mail fields.')
      return
    }

    try {
      const res = await fetch('http://localhost:8101/api/sendmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromEmail,
          xlsxData: excelData,
          subject,
          text,
        }),
      })

      const json = await res.json()

      if (res.ok) {
        setMailStatus(`✅ ${json.message || 'Emails sent successfully.'}`)
        setPerEmailStatus(json.result || [])
      } else {
        setMailStatus(`❌ ${json.error || 'Failed to send emails.'}`)
      }
    } catch (err) {
      console.error('Send mail failed:', err)
      setMailStatus('❌ Mail failed due to network or server error.')
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-3xl font-semibold mb-4">Welcome to your Dashboard</h2>

      {/* File Upload */}
      <div className="mb-4">
        <input
          type="file"
          accept=".xlsx,.csv"
          onChange={handleFileUpload}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full
                     file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700
                     hover:file:bg-blue-100"
        />
      </div>

      {loading && <p className="text-blue-500">Uploading and processing...</p>}

      {/* Excel Table */}
      {excelData.length > 0 && (
        <div className="overflow-x-auto mt-6">
          <table className="min-w-full border text-sm text-left">
            <thead className="bg-gray-200">
              <tr>
                {Object.keys(excelData[0]).map((key) => (
                  <th key={key} className="border px-4 py-2">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {excelData.map((row, index) => {
                const emailStatus = perEmailStatus.find(
                  (entry) => entry.email === row.email
                )
                const bgColor =
                  emailStatus?.status.includes('✅')
                    ? 'bg-green-100'
                    : emailStatus?.status.includes('❌')
                    ? 'bg-red-100'
                    : ''
                return (
                  <tr key={index} className={bgColor}>
                    {Object.values(row).map((value, i) => (
                      <td key={i} className="border px-4 py-2">
                        {value}
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Mail Input Fields */}
      <div className="mt-8 space-y-4">
        <input
          type="email"
          value={fromEmail}
          onChange={(e) => setFromEmail(e.target.value)}
          placeholder="From Email"
          className="w-full px-4 py-2 border rounded"
        />
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Subject"
          className="w-full px-4 py-2 border rounded"
        />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Email Body"
          rows={4}
          className="w-full px-4 py-2 border rounded"
        />
        <button
          onClick={handleSendMail}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Send Emails
        </button>
        {mailStatus && (
          <p
            className={`mt-2 font-semibold ${
              mailStatus.startsWith('✅') ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {mailStatus}
          </p>
        )}
      </div>
    </div>
  )
}