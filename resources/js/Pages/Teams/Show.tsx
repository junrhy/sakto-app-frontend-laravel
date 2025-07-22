import React from 'react';
import { Head, Link } from '@inertiajs/react';
import TeamsLayout from '@/Layouts/TeamsLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { Separator } from '@/Components/ui/separator';
import { ArrowLeft, Edit, User, Mail, Phone, Calendar, Globe, Languages, FileText, Shield, Monitor } from 'lucide-react';
import { TeamMember } from '@/types/models';
import { Label } from '@/Components/ui/label';

interface Props {
  auth: {
    user: any;
  };
  teamMember: TeamMember;
  availableRoles: Record<string, string>;
  availableApps: Record<string, string>;
}

export default function Show({ auth, teamMember, availableRoles, availableApps }: Props) {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        Active
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-gray-100 text-gray-600">
        Inactive
      </Badge>
    );
  };

  const getVerificationBadge = (isVerified: boolean) => {
    return isVerified ? (
      <Badge variant="default" className="bg-blue-100 text-blue-800">
        Verified
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
        Pending
      </Badge>
    );
  };

  return (
    <TeamsLayout
      user={auth.user}
      header={
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            Team Member Details
          </h2>
          <div className="flex items-center gap-2">
            <Link href={route('teams.edit', teamMember.identifier)}>
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </Link>
            <Link href={route('teams.index')}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Team
              </Button>
            </Link>
          </div>
        </div>
      }
    >
      <Head title={`${teamMember.full_name} - Team Member`} />

      <div className="py-12">
        <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Header */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-6">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src={teamMember.profile_picture} />
                      <AvatarFallback className="text-lg">
                        {getInitials(teamMember.first_name, teamMember.last_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-2xl font-bold">{teamMember.full_name}</h1>
                        {getStatusBadge(teamMember.is_active)}
                        {getVerificationBadge(teamMember.email_verified)}
                      </div>
                      <div className="flex items-center gap-4 text-gray-600">
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          <span>{teamMember.email}</span>
                        </div>
                        {teamMember.contact_number && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            <span>{teamMember.contact_number}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Roles and Permissions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Roles & Permissions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-3">Assigned Roles</h4>
                    <div className="flex flex-wrap gap-2">
                      {teamMember.roles.length > 0 ? (
                        teamMember.roles.map((role) => (
                          <Badge key={role} variant="outline">
                            {availableRoles[role] || role}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">No roles assigned</p>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-3">Allowed Applications</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {teamMember.allowed_apps.length > 0 ? (
                        teamMember.allowed_apps.map((app) => (
                          <div key={app} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                            <Monitor className="w-4 h-4 text-gray-500" />
                            <span className="text-sm">{availableApps[app] || app}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">No applications assigned</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Activity Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Activity Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Last Login</Label>
                      <p className="text-sm">
                        {teamMember.last_logged_in ? formatDate(teamMember.last_logged_in) : 'Never'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Last Activity</Label>
                      <p className="text-sm">
                        {teamMember.last_activity_at ? formatDate(teamMember.last_activity_at) : 'Never'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Password Changed</Label>
                      <p className="text-sm">
                        {teamMember.password_changed_at ? formatDate(teamMember.password_changed_at) : 'Never'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Email Verified</Label>
                      <p className="text-sm">
                        {teamMember.email_verified_at ? formatDate(teamMember.email_verified_at) : 'Not verified'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              {teamMember.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 whitespace-pre-wrap">{teamMember.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Member Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Member Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Member ID</Label>
                    <p className="text-sm font-mono">{teamMember.identifier}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Created</Label>
                    <p className="text-sm">{formatDate(teamMember.created_at)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Last Updated</Label>
                    <p className="text-sm">{formatDate(teamMember.updated_at)}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle>Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-500" />
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Timezone</Label>
                      <p className="text-sm">{teamMember.timezone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Languages className="w-4 h-4 text-gray-500" />
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Language</Label>
                      <p className="text-sm">{teamMember.language.toUpperCase()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href={route('teams.edit', teamMember.identifier)}>
                    <Button variant="outline" className="w-full">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Member
                    </Button>
                  </Link>
                  <Link href={route('teams.index')}>
                    <Button variant="outline" className="w-full">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Team
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </TeamsLayout>
  );
} 