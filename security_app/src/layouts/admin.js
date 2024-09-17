import React from 'react'
import Aside from '../components/Admin/Aside/Aside'

export default function AdminLayout({children}) {
  return (
    <>
      <Aside />
      {
        children
      }
    </>
  )
}
