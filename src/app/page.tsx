'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import axios from 'axios'
import React, { useEffect, useState } from 'react'

import InputComponent from '@/components/InputComponent'
import Select from '@/components/Select'

const Page = () => {
  const [gdNo, setGdNo] = useState('')
  const [policeStation, setPoliceStation] = useState('')
  const [vadiName, setVadiName] = useState('')
  const [accusedName, setAccusedName] = useState('')
  const [underSection, setUnderSection] = useState('')
  const [status, setStatus] = useState('')
  const [place, setPlace] = useState('')
  const [entries, setEntries] = useState([])

  const inputFields = [
    { label: "GD No.", value: gdNo, setInput: (e: React.ChangeEvent<HTMLInputElement>) => setGdNo(e.target.value) },
    { label: "Police Station", value: policeStation, setInput: (e: React.ChangeEvent<HTMLInputElement>) => setPoliceStation(e.target.value) },
    { label: "Vadi Name", value: vadiName, setInput: (e: React.ChangeEvent<HTMLInputElement>) => setVadiName(e.target.value) },
    { label: "Accused Name", value: accusedName, setInput: (e: React.ChangeEvent<HTMLInputElement>) => setAccusedName(e.target.value) },
    { label: "Under Section", value: underSection, setInput: (e: React.ChangeEvent<HTMLInputElement>) => setUnderSection(e.target.value) },
    { label: "Status", value: status, setInput: (e: React.ChangeEvent<HTMLInputElement>) => setStatus(e.target.value) },
    { label: "Place", value: place, setInput: (e: React.ChangeEvent<HTMLInputElement>) => setPlace(e.target.value) }
  ]

  const handleSubmit = async () => {
    try {
      const payload = {
        gdNo,
        policeStation,
        vadiName,
        accusedName,
        underSection,
        status,
        place,
      }

      const response = await axios.post('/api/demo', payload)
      const data = response.data;
      alert('Entry saved successfully!')
      console.log(data)
      fetchData() // Refresh the list after posting
    } catch (err) {
      console.error('Error saving entry:', err)
      alert('Failed to save entry.')
    }
  }

  const fetchData = async () => {
    try {
      const response = await axios.get('/api/demo')
      const data = response.data;
      setEntries(response.data.data)
    } catch (err) {
      console.error('Error fetching entries:', err)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])
  return (
    <div className='min-h-screen flex sm:flex-col @container  items-center px-12  justify-between  py-10'>
      <Card className="w-full  max-w-md bg-neutral-100">
        <CardHeader>
          <CardTitle>
            <h1 className='text-2xl'>Malkhaan Entry Form</h1>
          </CardTitle>
          <div className='w-full flex items-center justify-between mt-2'>
            <label>Case Property</label>
            <Select />
          </div>
        </CardHeader>

        <CardContent>
          <form>
            <div className="grid grid-cols-2 gap-2">
              {inputFields.map((field, index) => (
                <InputComponent key={index} {...field} />
              ))}
            </div>
          </form>
        </CardContent>

        <CardFooter className="grid grid-cols-2 gap-4">
          <Button onClick={handleSubmit} type="button" className="w-full">
            Submit Entry
          </Button>
          <Button variant="outline" className="w-full">
            Login with Google
          </Button>
        </CardFooter>
      </Card>

      {/* Optional: Display Saved Entries */}
      <div className='mt-10 w-full sm:flex-col md:items-center  max-w-3xl'>
        <h2 className='text-xl mb-4 font-semibold'>Saved Entries:</h2>
        <ul className='space-y-2'>
          {entries && entries?.map((entry: any, index) => (
            <li key={index} className='p-4 bg-white shadow rounded'>
              <p><strong>GD No.:</strong> {entry.gdNo}</p>
              <p><strong>Police Station:</strong> {entry.policeStation}</p>
              <p><strong>Vadi:</strong> {entry.vadiName}</p>
              <p><strong>Accused:</strong> {entry.accusedName}</p>
              <p><strong>Section:</strong> {entry.underSection}</p>
              <p><strong>Status:</strong> {entry.status}</p>
              <p><strong>Place:</strong> {entry.place}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default Page
