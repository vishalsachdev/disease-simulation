import { Routes, Route } from 'react-router-dom'
import Landing from './Landing'
import Sim1App from './sim1/Sim1App'
import Sim3App from './sim3/Sim3App'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/sim1/*" element={<Sim1App />} />
      <Route path="/sim3/*" element={<Sim3App />} />
    </Routes>
  )
}
