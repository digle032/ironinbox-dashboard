import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import Header from '../components/layout/Header';
import { RiAddLine, RiMoreLine, RiDeleteBinLine } from 'react-icons/ri';

const KeywordMonitoring: React.FC = () => {
  const { 
    keywords, 
    addKeyword, 
    deleteKeyword,
    detectionOptions,
    detectionActions,
    updateDetectionOptions,
    updateDetectionActions
  } = useApp();

  const [newKeyword, setNewKeyword] = useState('');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const handleAddKeyword = () => {
    if (newKeyword.trim()) {
      addKeyword(newKeyword.trim());
      setNewKeyword('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddKeyword();
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <Header title="Keyword Monitoring" />

      <div className="p-8 max-w-4xl">
        <div className="space-y-8">
          {/* Active Keywords Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Active Keywords</h2>
            
            {/* Add New Keyword */}
            <div className="mb-6">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Enter new keyword..."
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleAddKeyword}
                  disabled={!newKeyword.trim()}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <RiAddLine className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Keywords List */}
            <div className="flex flex-wrap gap-3">
              {keywords.length === 0 ? (
                <p className="text-gray-500 text-sm">No keywords added yet</p>
              ) : (
                keywords.map((keyword) => (
                  <div
                    key={keyword.id}
                    className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full border border-blue-200 group hover:bg-blue-100 transition-colors"
                  >
                    <span className="font-medium">{keyword.value}</span>
                    <div className="relative">
                      <button
                        onClick={() => setActiveMenu(activeMenu === keyword.id ? null : keyword.id)}
                        className="p-1 hover:bg-blue-200 rounded transition-colors"
                      >
                        <RiMoreLine className="w-4 h-4" />
                      </button>

                      {/* Dropdown Menu */}
                      {activeMenu === keyword.id && (
                        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-10 min-w-[120px]">
                          <button
                            onClick={() => {
                              deleteKeyword(keyword.id);
                              setActiveMenu(null);
                            }}
                            className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <RiDeleteBinLine className="w-4 h-4" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Detection Options Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Detection Options</h2>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={detectionOptions.caseInsensitive}
                  onChange={(e) => updateDetectionOptions({ caseInsensitive: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
                <div>
                  <span className="text-gray-800 font-medium group-hover:text-blue-600 transition-colors">
                    Case-insensitive matching
                  </span>
                  <p className="text-sm text-gray-500">Ignore case when matching keywords (e.g., "Urgent" matches "urgent")</p>
                </div>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={detectionOptions.matchInSubject}
                  onChange={(e) => updateDetectionOptions({ matchInSubject: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
                <div>
                  <span className="text-gray-800 font-medium group-hover:text-blue-600 transition-colors">
                    Match in subject line
                  </span>
                  <p className="text-sm text-gray-500">Search for keywords in email subject lines</p>
                </div>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={detectionOptions.matchInBody}
                  onChange={(e) => updateDetectionOptions({ matchInBody: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
                <div>
                  <span className="text-gray-800 font-medium group-hover:text-blue-600 transition-colors">
                    Match in body
                  </span>
                  <p className="text-sm text-gray-500">Search for keywords in email body content</p>
                </div>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={detectionOptions.wholeWordOnly}
                  onChange={(e) => updateDetectionOptions({ wholeWordOnly: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
                <div>
                  <span className="text-gray-800 font-medium group-hover:text-blue-600 transition-colors">
                    Whole-word only
                  </span>
                  <p className="text-sm text-gray-500">Only match complete words (e.g., "verify" won't match "verification")</p>
                </div>
              </label>
            </div>
          </div>

          {/* Detection Actions Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Detection Actions</h2>
            <p className="text-sm text-gray-600 mb-4">
              Define what happens when a keyword is detected in an email.
            </p>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={detectionActions.flagEmail}
                  onChange={(e) => updateDetectionActions({ flagEmail: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
                <div>
                  <span className="text-gray-800 font-medium group-hover:text-blue-600 transition-colors">
                    Flag the email
                  </span>
                  <p className="text-sm text-gray-500">Automatically flag emails containing keywords</p>
                </div>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={detectionActions.logMatch}
                  onChange={(e) => updateDetectionActions({ logMatch: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
                <div>
                  <span className="text-gray-800 font-medium group-hover:text-blue-600 transition-colors">
                    Log keyword match
                  </span>
                  <p className="text-sm text-gray-500">Record all keyword matches in the system log</p>
                </div>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={detectionActions.showInDashboard}
                  onChange={(e) => updateDetectionActions({ showInDashboard: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
                <div>
                  <span className="text-gray-800 font-medium group-hover:text-blue-600 transition-colors">
                    Show reason in dashboard
                  </span>
                  <p className="text-sm text-gray-500">Display the matched keyword in the flagged emails dashboard</p>
                </div>
              </label>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeywordMonitoring;
