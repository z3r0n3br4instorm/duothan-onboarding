"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw, Users, Calendar } from "lucide-react"

interface Team {
  _id: string
  teamData: {
    teamName: string
    teamEmail: string
    memberNames: string[]
  }
  registrationDate: string
  status: string
}

export default function AdminDashboard() {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTeams = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/register-team")
      const data = await response.json()
      setTeams(data.teams || [])
    } catch (error) {
      console.error("Error fetching teams:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTeams()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Duothan 5.0 Admin</h1>
            <p className="text-gray-600">Registered Teams Dashboard</p>
          </div>
          <Button onClick={fetchTeams} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="flex items-center p-6">
              <Users className="w-8 h-8 text-blue-600 mr-4" />
              <div>
                <p className="text-2xl font-bold">{teams.length}</p>
                <p className="text-gray-600">Total Teams</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <Calendar className="w-8 h-8 text-green-600 mr-4" />
              <div>
                <p className="text-2xl font-bold">
                  {
                    teams.filter((team) => new Date(team.registrationDate).toDateString() === new Date().toDateString())
                      .length
                  }
                </p>
                <p className="text-gray-600">Today's Registrations</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center mr-4">
                <span className="text-white font-bold">A</span>
              </div>
              <div>
                <p className="text-2xl font-bold">{teams.filter((team) => team.status === "registered").length}</p>
                <p className="text-gray-600">Active Registrations</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Registered Teams</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading teams...</div>
            ) : teams.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No teams registered yet</div>
            ) : (
              <div className="space-y-4">
                {teams.map((team) => (
                  <div key={team._id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{team.teamData.teamName}</h3>
                        <p className="text-gray-600">{team.teamData.teamEmail}</p>
                      </div>
                      <Badge variant="outline">{team.status}</Badge>
                    </div>
                    <div className="mb-2">
                      <p className="text-sm text-gray-600">Members:</p>
                      <div className="flex flex-wrap gap-2">
                        {team.teamData.memberNames.map((name, index) => (
                          <Badge key={index} variant="secondary">
                            {name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      Registered: {new Date(team.registrationDate).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
