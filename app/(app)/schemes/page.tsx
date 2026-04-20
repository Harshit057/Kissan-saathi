'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/auth';

interface Scheme {
  id: string;
  name: string;
  description: string;
  ministry: string;
  benefits: string[];
  eligibility: string[];
  applicationDeadline: string;
  estimatedBenefit: string;
  eligibilityMatch: number;
  status: 'eligible' | 'applied' | 'ineligible';
}

export default function SchemesPage() {
  const [filterStatus, setFilterStatus] = useState<'all' | 'eligible' | 'applied' | 'ineligible'>('all');
  const { user } = useAuthStore();

  const schemes: Scheme[] = [
    {
      id: '1',
      name: 'Pradhan Mantri Fasal Bima Yojana',
      description: 'Comprehensive insurance cover for crops against financial losses due to crop loss/damage',
      ministry: 'Ministry of Agriculture & Farmers Welfare',
      benefits: ['Crop insurance coverage', 'Claim settlement support', '72 hour claim processing'],
      eligibility: ['Farmers with land holding', 'Growing notified crops', 'Paying insurance premium'],
      applicationDeadline: '2025-06-30',
      estimatedBenefit: '₹1,00,000 - ₹5,00,000',
      eligibilityMatch: 95,
      status: 'eligible'
    },
    {
      id: '2',
      name: 'PM-Kisan Samman Nidhi',
      description: 'Direct benefit transfer of ₹6000 per year to farmer households',
      ministry: 'Ministry of Agriculture & Farmers Welfare',
      benefits: ['₹6000 annual income support', 'Direct bank transfer', 'No hidden conditions'],
      eligibility: ['Indian farmer', 'Land holding up to 2 hectares', 'Active bank account'],
      applicationDeadline: '2025-12-31',
      estimatedBenefit: '₹6000 per year',
      eligibilityMatch: 98,
      status: 'applied'
    },
    {
      id: '3',
      name: 'Soil Health Card Scheme',
      description: 'Free soil testing and health cards to improve crop productivity',
      ministry: 'Ministry of Agriculture & Farmers Welfare',
      benefits: ['Free soil testing', 'Health card delivery', 'Nutrient recommendations'],
      eligibility: ['Registered farmers', 'Agricultural land holders', 'Any crop type'],
      applicationDeadline: '2025-08-31',
      estimatedBenefit: 'Free soil testing',
      eligibilityMatch: 100,
      status: 'eligible'
    },
    {
      id: '4',
      name: 'Rashtriya Krishi Vikas Yojana',
      description: 'State-led agricultural development with focus on crop production',
      ministry: 'Ministry of Agriculture & Farmers Welfare',
      benefits: ['Agricultural productivity increase', 'Subsidy for modern equipment', 'Training programs'],
      eligibility: ['State resident farmers', 'Progressive farmers', 'Specific crop focus regions'],
      applicationDeadline: '2025-09-30',
      estimatedBenefit: 'Up to ₹2,00,000 subsidy',
      eligibilityMatch: 60,
      status: 'ineligible'
    },
  ];

  const filteredSchemes = schemes.filter(scheme => {
    if (filterStatus === 'all') return true;
    return scheme.status === filterStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'eligible':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'applied':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'ineligible':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'eligible':
        return 'You are Eligible';
      case 'applied':
        return 'Application Submitted';
      case 'ineligible':
        return 'Not Eligible';
      default:
        return status;
    }
  };

  const stats = [
    {
      label: 'Total Schemes',
      value: schemes.length,
      icon: '🏛️'
    },
    {
      label: 'Eligible Schemes',
      value: schemes.filter(s => s.status === 'eligible').length,
      icon: '✓'
    },
    {
      label: 'Applications Submitted',
      value: schemes.filter(s => s.status === 'applied').length,
      icon: '📤'
    },
    {
      label: 'Potential Benefits',
      value: '₹10+ Lakhs',
      icon: '💰'
    },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Government Schemes</h1>
        <p className="text-muted-text">Find schemes you are eligible for</p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow-sm border border-border p-4">
            <p className="text-xs text-muted-text mb-2">{stat.label}</p>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <span className="text-3xl">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-border p-4">
        <h2 className="text-lg font-semibold text-foreground mb-4">Filter Schemes</h2>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {['all', 'eligible', 'applied', 'ineligible'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status as any)}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                filterStatus === status
                  ? 'bg-primary text-white'
                  : 'bg-muted text-foreground hover:bg-primary/10'
              }`}
            >
              {status === 'all' ? 'All Schemes' : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Schemes List */}
      <div className="space-y-4">
        {filteredSchemes.map(scheme => (
          <div key={scheme.id} className="bg-white rounded-lg shadow-sm border border-border overflow-hidden">
            {/* Header */}
            <div className={`p-4 md:p-6 border-b border-border flex items-start justify-between ${scheme.status === 'eligible' ? 'bg-green-50' : scheme.status === 'applied' ? 'bg-blue-50' : scheme.status === 'ineligible' ? 'bg-red-50' : 'bg-white'}`}>
              <div className="flex-1">
                <div className="flex items-start gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-foreground">{scheme.name}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(scheme.status)}`}>
                    {getStatusLabel(scheme.status)}
                  </span>
                </div>
                <p className="text-sm text-muted-text">{scheme.ministry}</p>
              </div>
              {scheme.status === 'eligible' && (
                <div className="text-right ml-4">
                  <p className="text-xs text-muted-text">Eligibility Match</p>
                  <p className="text-2xl font-bold text-green-600">{scheme.eligibilityMatch}%</p>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-4 md:p-6 space-y-4">
              <p className="text-foreground">{scheme.description}</p>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Benefits */}
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Key Benefits</h4>
                  <ul className="space-y-2">
                    {scheme.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                        <span className="text-green-600 font-bold">✓</span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 p-3 bg-primary/5 rounded-lg">
                    <p className="text-xs text-muted-text mb-1">Estimated Benefit</p>
                    <p className="font-semibold text-primary">{scheme.estimatedBenefit}</p>
                  </div>
                </div>

                {/* Eligibility */}
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Eligibility Criteria</h4>
                  <ul className="space-y-2">
                    {scheme.eligibility.map((criterion, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                        <span className="text-primary">•</span>
                        {criterion}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 p-3 bg-accent/5 rounded-lg">
                    <p className="text-xs text-muted-text mb-1">Application Deadline</p>
                    <p className="font-semibold text-accent">
                      {new Date(scheme.applicationDeadline).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-border">
                <button className="flex-1 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors">
                  {scheme.status === 'applied' ? 'View Application' : scheme.status === 'eligible' ? 'Apply Now' : 'Learn More'}
                </button>
                <button className="flex-1 px-4 py-2 border border-border text-foreground hover:bg-muted rounded-lg font-medium transition-colors">
                  Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredSchemes.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-border">
          <p className="text-4xl mb-4">🔍</p>
          <p className="text-foreground font-semibold mb-2">No schemes found</p>
          <p className="text-muted-text">Try changing your filter or check back later for new schemes</p>
        </div>
      )}
    </div>
  );
}
