'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'


export default function DashboardPage() {

  const searchParams = useSearchParams()
  const [excelData, setExcelData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [sending , setSending] = useState(false)
  const [fromEmail, setFromEmail] = useState('')
  const [user, setUser] = useState('')
  const [subject, setSubject] = useState('')
  const [text, setText] = useState('')
  const [mailStatus, setMailStatus] = useState('')
  const [perEmailStatus, setPerEmailStatus] = useState<
    { email: string; status: string }[]
  >([])

  useEffect(() => {
    const userEmail = searchParams.get('userEmail')
    const userName = searchParams.get('userName')
    if (userEmail) setFromEmail(userEmail)
    if (userName) setUser(userName)
  }, [searchParams])

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
      setMailStatus('Please fill in all mail fields.')
      return
    }
    setSending(true);
    try {
      const res = await fetch('http://localhost:8101/api/sendmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user,
          fromEmail,
          xlsxData: excelData,
          subject,
          text,
        }),
      })

      const json = await res.json()

      if (res.ok) {
        setMailStatus(`${json.message || 'Emails sent successfully.'}`)
        setPerEmailStatus(json.result || [])
      } else {
        setMailStatus(`${json.error || 'Failed to send emails.'}`)
      }
    } catch (err) {
      console.error('Send mail failed:', err)
      setMailStatus('Mail failed due to network or server error.')
    }
    finally{
      setSending(false);
    }
  }


  const handleDownloadExcel = () => {
  if (excelData.length === 0) return

  // Clone the data and attach status
  const dataWithStatus = excelData.map((row) => {
    const match = perEmailStatus.find((entry) => entry.email === row.email)
    return {
      ...row,
      Status: match?.status || 'Pending',
    }
  })

  // Convert to worksheet
  const ws = XLSX.utils.json_to_sheet(dataWithStatus)

  // Create workbook
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'EmailStatus')

  // Write file
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })
  saveAs(blob, 'EmailStatus.xlsx')
}


  return (
    <div className="mt-20 p-6 bg-custom-lightblue min-h-screen">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-4xl font-bold mb-8 text-gray-800">
          Sent Mails in One Click
        </h2>

        {/* File Upload */}
        <div className="mb-6 bg-white p-6 rounded-xl shadow-sm flex justify-between">
        <div className="">
          <input
            type="file"
            accept=".xlsx,.csv"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg
                       file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700
                       hover:file:bg-blue-200 transition"
          />
          {loading && <p className="text-blue-600 mt-2">Uploading and processing...</p>}
          
        </div>{excelData.length > 0 && (
        <div className=""><button
    onClick={handleDownloadExcel}
    className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition"
  >
    Download Status Excel
  </button></div>
        )}
</div>
        {/* Excel Table */}
        {excelData.length > 0 && (
          <div className="overflow-x-auto mt-6 bg-white p-4 rounded-xl shadow-sm">
            <table className="min-w-full border text-sm text-left">
              <thead className="bg-gray-100 text-gray-700">
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
                    emailStatus?.status.includes('Sent')
                      ? 'bg-green-50'
                      : emailStatus?.status.includes('Failed')
                        ? 'bg-red-50'
                        : ''
                  return (
                    <tr
                      key={index}
                      className={`transition-colors ${bgColor} hover:bg-gray-50`}
                    >
                      {Object.values(row).map((value, i) => (
                        <td key={i} className="border px-4 py-2">
                          {String(value)}
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
        <div className="mt-10 bg-white p-6 rounded-xl shadow-sm space-y-4">
          <input
            type="user"
            value={String(user)}
            onChange={(e) => setUser(e.target.value)}
            placeholder="User Name"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <input
            type="email"
            value={String(fromEmail)}
            onChange={(e) => setFromEmail(e.target.value)}
            placeholder="From Email"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Email Body"
            rows={4}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <button
            onClick={handleSendMail}
            disabled={sending}
            className="relative w-full py-3 bg-blue-600 text-white font-semibold rounded-lg overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {/* Progress animation */}
            {sending && (
              <div className="absolute inset-0 bg-blue-800 animate-fakeProgress z-0" />
            )}
            <span className="relative z-10">
              {sending ? 'Sending...' : 'Send Emails'}
            </span>
          </button>
          {mailStatus && (
            <p
              className={`mt-2 font-medium ${mailStatus.startsWith('Sent') ? 'text-green-600' : 'text-red-600'
                }`}
            >
            </p>
          )}
        </div>
      </div>
    </div>
  )
}