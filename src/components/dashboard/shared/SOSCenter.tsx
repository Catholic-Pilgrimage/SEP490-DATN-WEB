import React from 'react';
import {
  AlertTriangle,
  Phone,
  MapPin,
  Clock,
  User,
  CheckCircle,
  Navigation
} from 'lucide-react';

export const SOSCenter: React.FC = () => {
  const sosAlerts = [
    {
      id: 1,
      pilgrim: 'John Smith',
      location: 'Grotto Area, Section B',
      site: 'Lourdes Sanctuary',
      issue: 'Medical emergency - chest pain',
      time: '3 minutes ago',
      phone: '+1 234 567 8900',
      severity: 'high',
      status: 'active',
      assignedGuide: null,
      coordinates: { lat: 43.0942, lng: -0.0464 }
    },
    {
      id: 2,
      pilgrim: 'Maria Garcia',
      location: 'Main Basilica Entrance',
      site: 'Fatima Sanctuary',
      issue: 'Lost group, elderly pilgrim disoriented',
      time: '8 minutes ago',
      phone: '+351 912 345 678',
      severity: 'medium',
      status: 'assigned',
      assignedGuide: 'Guide Carlos',
      coordinates: { lat: 39.6319, lng: -8.6724 }
    },
    {
      id: 3,
      pilgrim: 'Thomas Wilson',
      location: 'Parking Area C',
      site: 'Medjugorje Parish',
      issue: 'Vehicle breakdown, family stranded',
      time: '15 minutes ago',
      phone: '+387 36 123 456',
      severity: 'low',
      status: 'resolved',
      assignedGuide: 'Guide Ana',
      coordinates: { lat: 43.1848, lng: 17.6750 }
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'border-red-500 bg-red-50';
      case 'medium': return 'border-amber-500 bg-amber-50';
      case 'low': return 'border-blue-500 bg-blue-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'active':
        return { label: 'Active', color: 'red', icon: AlertTriangle };
      case 'assigned':
        return { label: 'Assigned', color: 'amber', icon: Clock };
      case 'resolved':
        return { label: 'Resolved', color: 'green', icon: CheckCircle };
      default:
        return { label: 'Unknown', color: 'gray', icon: AlertTriangle };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">SOS Emergency Center</h1>
          <p className="text-slate-600 mt-2">Monitor and respond to pilgrim emergencies</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-slate-600">Active Alerts</div>
            <div className="text-2xl font-bold text-red-600">
              {sosAlerts.filter(alert => alert.status === 'active').length}
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Alerts', value: sosAlerts.length, color: 'blue' },
          { label: 'Active', value: sosAlerts.filter(a => a.status === 'active').length, color: 'red' },
          { label: 'In Progress', value: sosAlerts.filter(a => a.status === 'assigned').length, color: 'amber' },
          { label: 'Resolved', value: sosAlerts.filter(a => a.status === 'resolved').length, color: 'green' }
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="text-sm text-slate-600 mb-1">{stat.label}</div>
            <div className={`text-3xl font-bold ${stat.color === 'red' ? 'text-red-600' :
                stat.color === 'amber' ? 'text-amber-600' :
                  stat.color === 'green' ? 'text-green-600' :
                    'text-blue-600'
              }`}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* SOS Alerts List */}
      <div className="space-y-4">
        {sosAlerts.map((alert) => {
          const statusInfo = getStatusInfo(alert.status);
          const StatusIcon = statusInfo.icon;

          return (
            <div
              key={alert.id}
              className={`
                bg-white rounded-2xl shadow-sm border-l-4 p-6 transition-all
                ${getSeverityColor(alert.severity)}
                ${alert.status === 'active' ? 'animate-pulse' : ''}
              `}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`
                    p-3 rounded-xl
                    ${alert.severity === 'high' ? 'bg-red-100' :
                      alert.severity === 'medium' ? 'bg-amber-100' : 'bg-blue-100'}
                  `}>
                    <AlertTriangle className={`w-6 h-6 ${alert.severity === 'high' ? 'text-red-600' :
                        alert.severity === 'medium' ? 'text-amber-600' : 'text-blue-600'
                      }`} />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {alert.issue}
                    </h3>
                    <p className="text-slate-600">
                      {alert.site} • {alert.time}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`
                    inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium
                    ${statusInfo.color === 'red' ? 'bg-red-100 text-red-700' :
                      statusInfo.color === 'amber' ? 'bg-amber-100 text-amber-700' :
                        statusInfo.color === 'green' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}
                  `}>
                    <StatusIcon className="w-4 h-4" />
                    {statusInfo.label}
                  </span>

                  <span className={`
                    px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide
                    ${alert.severity === 'high' ? 'bg-red-200 text-red-800' :
                      alert.severity === 'medium' ? 'bg-amber-200 text-amber-800' :
                        'bg-blue-200 text-blue-800'}
                  `}>
                    {alert.severity}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-600">
                    <User className="w-4 h-4" />
                    <span className="text-sm">Pilgrim</span>
                  </div>
                  <div className="font-semibold text-slate-900">{alert.pilgrim}</div>
                  <div className="text-sm text-slate-600 flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {alert.phone}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">Location</span>
                  </div>
                  <div className="font-semibold text-slate-900">{alert.location}</div>
                  <div className="text-sm text-slate-600">{alert.site}</div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Response</span>
                  </div>
                  <div className="font-semibold text-slate-900">
                    {alert.assignedGuide || 'Unassigned'}
                  </div>
                  <div className="text-sm text-slate-600">{alert.time}</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {alert.status === 'active' && (
                  <>
                    <button className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
                      <Phone className="w-4 h-4" />
                      Call Pilgrim
                    </button>

                    <button className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                      <User className="w-4 h-4" />
                      Assign Guide
                    </button>

                    <button className="flex items-center gap-2 px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium">
                      <Navigation className="w-4 h-4" />
                      Get Directions
                    </button>
                  </>
                )}

                {alert.status === 'assigned' && (
                  <>
                    <button className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
                      <CheckCircle className="w-4 h-4" />
                      Mark Resolved
                    </button>

                    <button className="flex items-center gap-2 px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium">
                      <Phone className="w-4 h-4" />
                      Contact Guide
                    </button>
                  </>
                )}

                {alert.status === 'resolved' && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="font-medium">Emergency resolved successfully</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};