/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { BASE_URL } from "../../../src/config"

interface ExcelRow {
  sno: number
  email: string
  [key: string]: any
}

export default function DashboardPage() {

  const [excelData, setExcelData] = useState<ExcelRow[]>([])
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [fromEmail, setFromEmail] = useState('')
  const [user, setUser] = useState('')
  const [subject, setSubject] = useState('')
  const [text, setText] = useState('')
  const [linkendIn, setLinkedIn] = useState('')
  const [contact, setContact] = useState('')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [mailStatus, setMailStatus] = useState('')
  const [perEmailStatus, setPerEmailStatus] = useState<
    { email: string; status: string }[]
  >([])
  const [attachments, setAttachments] = useState<File[]>([]);

  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail')
    const userName = localStorage.getItem('userName')
    const contact = localStorage.getItem('contact')
    const linkendIn = localStorage.getItem('linkedIn')
    if (userEmail) setFromEmail(userEmail)
    if (userName) setUser(userName)
    if (contact) setContact(contact)
    if (linkendIn) setLinkedIn(linkendIn)
  }, [])


  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('files', file)

    setLoading(true)
    try {
      console.log(BASE_URL);
      const res = await fetch(`${BASE_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      })

      const json = await res.json()

      const serialKeys = ['sno', 'S.No', 'SNO', 'SNo'];

      const hasSerialAlready =
        json.length > 0 &&
        serialKeys.some((key) => key in json[0]);

      const dataWithSerial = hasSerialAlready
        ? json
        : json.map((row: any, index: number) => ({
          sno: index + 1,
          ...row,
        }))

      setExcelData(dataWithSerial);
    } catch (err) {
      console.error('Upload failed:', err)
    } finally {
      setLoading(false)
    }
  }
  const handleSendMail = async () => {
    if (!fromEmail || !subject || !text) {
      setMailStatus('Please fill in all mail fields.');
      return;
    }

    setSending(true);
    const formData = new FormData();
    formData.append("fromEmail", fromEmail);
    formData.append("user", user);
    formData.append("subject", subject);
    formData.append("text", text);
    formData.append("contact", contact);
    formData.append("linkenIn", linkendIn);
    formData.append("xlsxData", JSON.stringify(excelData));
    attachments.forEach((file) => {
      formData.append(`attachments`, file);
    });


    console.log('Files being sent:', attachments.length);
    for (const pair of formData.entries()) {
      if (pair[0] === 'attachments') {
        console.log('Attachment:', pair[1]);
      }
    }

    try {
      const res = await fetch(`${BASE_URL}/api/sendmail`, {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();

      if (res.ok) {
        setMailStatus(`${json.message || 'Emails sent successfully.'}`);
        setPerEmailStatus(json.result || []);
      } else {
        setMailStatus(`${json.error || 'Failed to send emails.'}`);
      }
    } catch (err) {
      console.error('Send mail failed:', err);
      setMailStatus('Mail failed due to network or server error.');
    } finally {
      setSending(false);
    }
  };

  const handleDownloadExcel = () => {
    if (excelData.length === 0) return

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
    saveAs(blob, 'SmartSender.xlsx')
  }

  return (
    <div className="p-6 bg-custom-lightblue min-h-screen">
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
          </div>
          {excelData.length > 0 && (
            <div className="">
              <button
                onClick={handleDownloadExcel}
                className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition"
              >
                Download Status Excel
              </button>
            </div>
          )}
        </div>

        {/* Excel Table */}
        {excelData.length > 0 && (
          <div className="mt-6 bg-white p-4 rounded-xl shadow-sm">
            {/* Table header */}
            <div className="overflow-x-auto">
              <table className="min-w-full table-fixed border border-gray-300 text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    {Object.keys(excelData[0])
                      .filter((key) => key.toLowerCase() !== 'status')
                      .map((key) => (
                        <th
                          key={key}
                          className="px-4 py-2 border font-semibold text-gray-700"
                          style={{ width: `${100 / Object.keys(excelData[0]).length}%` }}
                        >
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </th>
                      ))}
                  </tr>
                </thead>
              </table>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto max-h-96 overflow-x-auto">
              <table className="min-w-full table-fixed border border-gray-300 text-sm">
                <tbody>
                  {excelData.map((row, rowIndex) => {
                    const emailStatus = perEmailStatus.find(
                      (entry) => entry.email === row.email
                    );
                    const bgColor =
                      emailStatus?.status.includes('Sent')
                        ? 'bg-green-50'
                        : emailStatus?.status.includes('Failed')
                          ? 'bg-red-50'
                          : 'bg-gray-50';

                    return (
                      <tr key={rowIndex} className={bgColor}>
                        {Object.entries(row)
                          .filter(([key]) => key.toLowerCase() !== 'status')
                          .map(([key, value], colIndex) => (
                            <td
                              key={colIndex}
                              className="px-2 py-1 border"
                              style={{
                                width: `${100 / Object.keys(excelData[0]).length}%`
                              }}
                            >
                              <input
                                type="text"
                                className="w-full px-1 py-0.5 rounded border-0 bg-transparent focus:bg-white focus:border focus:border-blue-300 focus:outline-none"
                                value={value || ''}
                                onChange={(e) => {
                                  const newData = [...excelData];
                                  newData[rowIndex][key] = e.target.value;
                                  setExcelData(newData);
                                }}
                              />
                            </td>
                          ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Visual Mail Format Composer */}
        <div className="mt-28 bg-white p-6 rounded-xl shadow-md border border-gray-200 space-y-6">
          <h3 className="text-xl font-semibold text-gray-800">Compose a Mail</h3>

          {/* Headers */}
          <div className="space-y-3">
            <div className="flex items-center">
              <label className="w-20 font-medium text-gray-700">From:</label>
              <input
                type="email"
                disabled
                className="flex-1 px-4 py-2 border rounded-md bg-gray-100 text-gray-600"
              />
            </div>

            <div className="flex items-center">
              <label className="w-20 font-medium text-gray-700">To:</label>
              <input
                type="text"
                disabled
                value="Recipient list from Excel"
                className="flex-1 px-4 py-2 border rounded-md bg-gray-100 text-gray-600"
              />
            </div>

            <div className="flex items-center">
              <label className="w-20 font-medium text-gray-700">Subject:</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter email subject"
                className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>

            <div className="flex items-center">
              <label className="w-20 font-medium text-gray-700">Attachment:</label>
              <input
                type="file"
                multiple
                onChange={(e) => {
                  if (e.target.files) {
                    setAttachments(Array.from(e.target.files));
                  }
                }}
                className="px-6 block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg
         file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700
         hover:file:bg-blue-200 transition"
              />
            </div>
          </div>

          {/* Body Section: Realistic Email Format */}
          <div className="bg-gray-50 p-6 rounded-md border text-gray-800 font-[serif]">
            <p className="mb-4">
              Dear{' '}
              <input
                type="text"
                placeholder="Recipient Name from Excel"
                className="inline-block w-48 px-1 py-1 border-b border-gray-400 focus:outline-none focus:border-blue-400"
              />
              ,
            </p>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write your message here..."
              rows={6}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <p className="mt-6">
              Best Regards,
              <br />
              <input
                type="text"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                placeholder="Your Name"
                className="inline-block w-32 border-gray-400 focus:outline-none focus:border-blue-400"
              />
            </p>
              <input
                type="text"
                value={contact}
                onChange={(e) => setUser(e.target.value)}
                placeholder="Contact Info" 
                className="inline-block w-32 border-gray-400 focus:outline-none focus:border-blue-400"
              />
              <br />
              <input
                type="text"
                value={linkendIn}
                onChange={(e) => setUser(e.target.value)}
                placeholder="LinkedIn ID"
                className="inline-block w-48 border-gray-400 focus:outline-none focus:border-blue-400"
              />
              <span className="ml-4 w-32 border-gray-400 focus:outline-none focus:border-blue-400">
                *[This will be a HyperLink in the Mail.]</span>
          </div>

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
        </div>
      </div>
    </div>
  );
}