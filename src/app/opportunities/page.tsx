"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';


interface Opportunity {
  id: string;
  title: string;
  description: string;
  applicationForm: string;
  timeCommitment: string;
  location: string;
  tokenPrize: number;
  requirements: string;
}

export default function OpportunitiesPage() {
  const router = useRouter();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [textOverflow, setTextOverflow] = useState<{ [key: string]: boolean }>({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newOpportunity, setNewOpportunity] = useState({
    title: '',
    description: '',
    applicationForm: '',
    timeCommitment: '',
    location: '',
    tokenPrize: '',
    requirements: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [opportunityToDelete, setOpportunityToDelete] = useState<Opportunity | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        router.replace('/signin');
      }
    };
    checkUser();
  }, [router]);

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        const { data, error } = await supabase
          .from('opportunities')
          .select('*');
        
        if (error) {
          console.error('Error fetching opportunities:', error);
        } else {
          setOpportunities(data || []);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunities();
  }, []);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profiles, error } = await supabase
            .from('profiles')
            .select('admin')
            .eq('id', user.id)
            .single();
          
          if (error) {
            console.error('Error fetching profile:', error);
            setIsAdmin(false);
          } else {
            setIsAdmin(profiles?.admin === true);
          }
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a101f] flex items-center justify-center">
        <div className="text-white text-xl">Loading opportunities...</div>
      </div>
    );
  }

  const handleReadMore = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setShowDialog(true);
  };

  const checkTextOverflow = (element: HTMLElement, opportunityId: string) => {
    if (element && element.scrollHeight > element.clientHeight + 2) { // Add small buffer to prevent flickering
      setTextOverflow(prev => ({ ...prev, [opportunityId]: true }));
    } else {
      setTextOverflow(prev => ({ ...prev, [opportunityId]: false }));
    }
  };

  const handleAddOpportunity = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('opportunities')
        .insert([{
          title: newOpportunity.title,
          description: newOpportunity.description,
          applicationForm: newOpportunity.applicationForm,
          timeCommitment: newOpportunity.timeCommitment,
          location: newOpportunity.location,
          tokenPrize: parseInt(newOpportunity.tokenPrize),
          requirements: newOpportunity.requirements
        }]);

      if (error) {
        console.error('Error adding opportunity:', error);
        alert('Failed to add opportunity. Please try again.');
      } else {
        // Refresh opportunities list
        const { data, error: fetchError } = await supabase
          .from('opportunities')
          .select('*');
        
        if (!fetchError && data) {
          setOpportunities(data);
        }
        
        // Reset form and close modal
        setNewOpportunity({
          title: '',
          description: '',
          applicationForm: '',
          timeCommitment: '',
          location: '',
          tokenPrize: '',
          requirements: ''
        });
        setShowAddModal(false);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to add opportunity. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    return newOpportunity.title.trim() !== '' &&
           newOpportunity.description.trim() !== '' &&
           newOpportunity.applicationForm.trim() !== '' &&
           newOpportunity.timeCommitment.trim() !== '' &&
           newOpportunity.location.trim() !== '' &&
           newOpportunity.tokenPrize.trim() !== '' &&
           newOpportunity.requirements.trim() !== '' &&
           !isNaN(parseInt(newOpportunity.tokenPrize)) &&
           parseInt(newOpportunity.tokenPrize) > 0;
  };

  const handleDeleteOpportunity = async () => {
    if (!opportunityToDelete) return;
    
    try {
      const { error } = await supabase
        .from('opportunities')
        .delete()
        .eq('id', opportunityToDelete.id);

      if (error) {
        console.error('Error deleting opportunity:', error);
        alert('Failed to delete opportunity. Please try again.');
      } else {
        // Remove from local state
        setOpportunities(prev => prev.filter(opp => opp.id !== opportunityToDelete.id));
        setShowDeleteConfirm(false);
        setOpportunityToDelete(null);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to delete opportunity. Please try again.');
    }
  };

  const confirmDelete = (opportunity: Opportunity) => {
    setOpportunityToDelete(opportunity);
    setShowDeleteConfirm(true);
  };

  return (
    <div className="min-h-screen bg-[#0a101f] py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Page Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-2 mt-16">
          Opportunities
        </h1>
        <p className="text-white text-center text-2xl mb-12 mx-8">
          Apply for mini-internships to volunteer and work with the TSA Board!
        </p>

        {/* Admin Add Opportunity Button */}
        {isAdmin && (
          <div className="flex justify-center mb-12">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-violet-500 text-white font-semibold hover:from-blue-600 hover:to-violet-600 transition cursor-pointer"
            >
              Add Opportunity
            </button>
          </div>
        )}

        {/* Opportunities List */}
        <div className="space-y-12">
          {opportunities.map((opportunity, index) => {
            const isEvenRow = index % 2 === 0;
            const hasOverflow = textOverflow[opportunity.id] || false;
            
            // Mobile layout - single card with all information
            const mobileCard = (
              <div className="lg:hidden">
                <div 
                  className="bg-[#181e29] p-6 relative rounded-lg"
                  style={{ 
                    boxShadow: '0 0 16px 0 #3b82f6, 0 0 24px 0 #8b5cf6, 0 0 0 1px #232a3a'
                  }}
                >
                  {/* Admin Delete Button */}
                  {isAdmin && (
                    <button
                      onClick={() => confirmDelete(opportunity)}
                      className="absolute top-4 right-4 text-red-400 hover:text-red-300 text-3xl font-bold focus:outline-none cursor-pointer z-10"
                      aria-label="Delete opportunity"
                    >
                      ×
                    </button>
                  )}
                  
                  <h2 className="text-xl font-bold text-white mb-3">
                    {opportunity.title}
                  </h2>
                  
                  <div className="text-white leading-relaxed mb-4">
                    <p className="text-md">
                      {opportunity.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                    <div>
                      <span className="bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent font-semibold">Time:</span>
                      <div className="text-white">{opportunity.timeCommitment}</div>
                    </div>
                    <div>
                      <span className="bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent font-semibold">Location:</span>
                      <div className="text-white">{opportunity.location}</div>
                    </div>
                    <div>
                      <span className="bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent font-semibold">Prize:</span>
                      <div className="text-white">{opportunity.tokenPrize} tokens</div>
                    </div>
                    <div>
                      <span className="bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent font-semibold">Requirements:</span>
                      <div className="text-white">{opportunity.requirements}</div>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <a
                      href={opportunity.applicationForm}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-violet-500 text-white font-semibold hover:from-blue-600 hover:to-violet-600 transition text-sm cursor-pointer"
                    >
                      Apply or Learn More
                    </a>
                  </div>
                </div>
              </div>
            );

            // Desktop layout - split cards
            const descriptionCard = (
              <div className="hidden lg:block w-full lg:w-[60%]">
                <div 
                  className="bg-[#181e29] p-8 h-70 relative rounded-lg flex flex-col"
                  style={{ 
                    boxShadow: '0 0 16px 0 #3b82f6, 0 0 24px 0 #8b5cf6, 0 0 0 1px #232a3a'
                  }}
                >
                  {/* Admin Delete Button */}
                  {isAdmin && (
                    <button
                      onClick={() => confirmDelete(opportunity)}
                      className="absolute top-4 right-4 text-red-400 hover:text-red-300 text-3xl font-bold focus:outline-none cursor-pointer z-10"
                      aria-label="Delete opportunity"
                    >
                      ×
                    </button>
                  )}
                  
                  <h2 className="text-2xl font-bold text-white mb-4 flex" style={{ maxHeight: '15%' }}>
                    {opportunity.title}
                  </h2>
                  <div className="flex-1 flex flex-col" style={{ maxHeight: '50%' }}>
                    <div className="text-white leading-relaxed overflow-hidden relative" style={{ maxHeight: '100%' }}>
                      <p 
                        className="text-md"
                        ref={(el) => {
                          if (el) {
                            // Use requestAnimationFrame for better timing
                            requestAnimationFrame(() => {
                              checkTextOverflow(el, opportunity.id);
                            });
                          }
                        }}
                        style={{ maxHeight: '100%', overflow: 'hidden' }}
                      >
                        {opportunity.description}
                      </p>
                      {hasOverflow && (
                        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#181e29] to-transparent pointer-events-none"></div>
                      )}
                    </div>
                    {hasOverflow && (
                      <div className="flex justify-start">
                        <button
                          onClick={() => handleReadMore(opportunity)}
                          className="text-blue-400 hover:text-blue-500 transition text-sm font-medium underline cursor-pointer"
                        >
                          Read More
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-start mt-4">
                    <a
                      href={opportunity.applicationForm}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-violet-500 text-white font-semibold hover:from-blue-600 hover:to-violet-600 transition text-lg cursor-pointer"
                    >
                      Apply or Learn More
                    </a>
                  </div>
                </div>
              </div>
            );
            
            const detailsCard = (
              <div className="hidden lg:block w-full lg:w-[40%]">
                <div 
                  className="bg-[#181e29] p-8 h-70 relative rounded-lg"
                  style={{ 
                    boxShadow: '0 0 10px 0 #3b82f6, 0 0 24px 0 #8b5cf6, 0 0 0 1px #232a3a'
                  }}
                >
                  {/* Admin Delete Button */}
                  {isAdmin && (
                    <button
                      onClick={() => confirmDelete(opportunity)}
                      className="absolute top-4 right-4 text-red-400 hover:text-red-300 text-3xl font-bold focus:outline-none cursor-pointer z-10"
                      aria-label="Delete opportunity"
                    >
                      ×
                    </button>
                  )}
                  
                  <div className="space-y-4 text-lg">
                    <span className="bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent font-semibold">Time Commitment:&nbsp;</span>
                    <span className="text-white font-medium">{opportunity.timeCommitment}</span>
                    <p></p>
                    <span className="bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent font-semibold">Location:&nbsp;</span>
                    <span className="text-white font-medium">{opportunity.location}</span>
                    <p></p>
                    <span className="bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent font-semibold">TSA Token Prize:&nbsp;</span>
                    <span className="text-white font-medium">{opportunity.tokenPrize} tokens</span>
                    <p></p>
                    <span className="bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent font-semibold">Requirements:&nbsp;</span>
                    <span className="text-white font-medium">{opportunity.requirements}</span>
                  </div>
                </div>
              </div>
            );

            return (
              <div key={opportunity.id}>
                {/* Mobile Layout */}
                {mobileCard}
                
                {/* Desktop Layout */}
                <div className="hidden lg:flex flex-col lg:flex-row gap-12">
                  {isEvenRow ? (
                    <>
                      {descriptionCard}
                      {detailsCard}
                    </>
                  ) : (
                    <>
                      {detailsCard}
                      {descriptionCard}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {opportunities.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-xl">No opportunities available at the moment.</p>
          </div>
        )}
      </div>

      {/* Description Dialog */}
      {showDialog && selectedOpportunity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-fade-in">
          <div className="bg-[#181e29] rounded-2xl shadow-2xl border border-[#232a3a] p-8 w-full max-w-2xl mx-4 relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl font-bold focus:outline-none cursor-pointer"
              onClick={() => setShowDialog(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <div className="text-2xl font-bold text-white mb-4">{selectedOpportunity.title}</div>
            <div className="text-white leading-relaxed text-lg max-h-96 overflow-y-auto">
              {selectedOpportunity.description}
            </div>
            <div className="flex justify-center mt-6">
              <a
                href={selectedOpportunity.applicationForm}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-violet-500 text-white font-semibold hover:from-blue-600 hover:to-violet-600 transition cursor-pointer"
              >
                Apply or Learn More
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Add Opportunity Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-fade-in custom-scrollbar">
          <div className="bg-[#181e29] rounded-2xl shadow-2xl border border-[#232a3a] p-8 w-full max-w-2xl mx-4 relative max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl font-bold focus:outline-none cursor-pointer"
              onClick={() => setShowAddModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <div className="text-2xl font-bold text-white mb-6">Add New Opportunity</div>
            
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-white font-medium mb-2">Title <span className='text-red-400'>*</span></label>
                <input
                  type="text"
                  className="w-full p-3 rounded-lg bg-[#232a3a] border border-[#3a4151] text-white focus:border-blue-500 focus:outline-none"
                  value={newOpportunity.title}
                  onChange={(e) => setNewOpportunity({ ...newOpportunity, title: e.target.value })}
                  placeholder="Enter opportunity title"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-white font-medium mb-2">Description <span className='text-red-400'>*</span></label>
                <textarea
                  className="w-full p-3 rounded-lg bg-[#232a3a] border border-[#3a4151] text-white focus:border-blue-500 focus:outline-none"
                  value={newOpportunity.description}
                  onChange={(e) => setNewOpportunity({ ...newOpportunity, description: e.target.value })}
                  placeholder="Enter opportunity description"
                  rows={4}
                />
              </div>

              {/* Application Form URL */}
              <div>
                <label className="block text-white font-medium mb-2">Application Form URL <span className='text-red-400'>*</span></label>
                <input
                  type="url"
                  className="w-full p-3 rounded-lg bg-[#232a3a] border border-[#3a4151] text-white focus:border-blue-500 focus:outline-none"
                  value={newOpportunity.applicationForm}
                  onChange={(e) => setNewOpportunity({ ...newOpportunity, applicationForm: e.target.value })}
                  placeholder="https://example.com/apply"
                />
              </div>

              {/* Time Commitment */}
              <div>
                <label className="block text-white font-medium mb-2">Time Commitment <span className='text-red-400'>*</span></label>
                <input
                  type="text"
                  className="w-full p-3 rounded-lg bg-[#232a3a] border border-[#3a4151] text-white focus:border-blue-500 focus:outline-none"
                  value={newOpportunity.timeCommitment}
                  onChange={(e) => setNewOpportunity({ ...newOpportunity, timeCommitment: e.target.value })}
                  placeholder="e.g., 1 hour per week, 5 hours"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-white font-medium mb-2">Location <span className='text-red-400'>*</span></label>
                <input
                  type="text"
                  className="w-full p-3 rounded-lg bg-[#232a3a] border border-[#3a4151] text-white focus:border-blue-500 focus:outline-none"
                  value={newOpportunity.location}
                  onChange={(e) => setNewOpportunity({ ...newOpportunity, location: e.target.value })}
                  placeholder="e.g., Leota MS, Online"
                />
              </div>

              {/* Token Prize */}
              <div>
                <label className="block text-white font-medium mb-2">TSA Token Prize <span className='text-gray-400'>(numerical value)</span> <span className='text-red-400'>*</span></label>
                <input
                  type="number"
                  className="w-full p-3 rounded-lg bg-[#232a3a] border border-[#3a4151] text-white focus:border-blue-500 focus:outline-none"
                  value={newOpportunity.tokenPrize}
                  onChange={(e) => setNewOpportunity({ ...newOpportunity, tokenPrize: e.target.value })}
                  placeholder="Enter number of tokens"
                  min="0"
                />
              </div>

              {/* Requirements */}
              <div>
                <label className="block text-white font-medium mb-2">Requirements <span className='text-gray-400'>(say None if no requirements)</span> <span className='text-red-400'>*</span></label>
                <input
                  type="text"
                  className="w-full p-3 rounded-lg bg-[#232a3a] border border-[#3a4151] text-white focus:border-blue-500 focus:outline-none"
                  value={newOpportunity.requirements}
                  onChange={(e) => setNewOpportunity({ ...newOpportunity, requirements: e.target.value })}
                  placeholder="e.g., Must have placed at states "
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end mt-6">
              <button
                onClick={handleAddOpportunity}
                disabled={!isFormValid() || isSubmitting}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-violet-500 text-white font-semibold hover:from-blue-600 hover:to-violet-600 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Adding...' : 'Add Opportunity'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && opportunityToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-fade-in">
          <div className="bg-[#181e29] rounded-2xl shadow-2xl border border-[#232a3a] p-8 w-full max-w-md mx-4 relative">
            <div className="text-2xl font-bold text-white mb-4">Confirm Delete</div>
            <div className="text-white mb-6">
              Are you sure you want to delete the opportunity "{opportunityToDelete.title}"? This action cannot be undone.
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setOpportunityToDelete(null);
                }}
                className="px-4 py-2 rounded-lg bg-gray-600 text-white font-semibold hover:bg-gray-700 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteOpportunity}
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
