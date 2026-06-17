import React, { useState, useRef, useEffect } from 'react';
import { facebookApi } from '../../services/facebook/api';
import { useFacebookPages } from '../../hooks/useFacebookPages';
import PostPreview from '../../components/facebook/PostPreview';
import MediaUploader from '../../components/facebook/MediaUploader';
import HashtagInput from '../../components/facebook/HashtagInput';
import BoostModal from '../../components/facebook/BoostModal';

export default function FacebookPostCreator() {
  const { pages, loading: pagesLoading } = useFacebookPages();

  // ---------- Core post data ----------
  const [pageId, setPageId] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [mediaItems, setMediaItems] = useState([]);
  const [scheduledFor, setScheduledFor] = useState('');
  const [showSchedule, setShowSchedule] = useState(false);
  const [privacy, setPrivacy] = useState('public');
  const [isAdPost, setIsAdPost] = useState(false);

  // ---------- Add‑to‑post features ----------
  const [feeling, setFeeling] = useState(null);
  const [location, setLocation] = useState(null);
  const [cta, setCta] = useState(null);
  const [linkPreview, setLinkPreview] = useState(null);
  const [abTest, setAbTest] = useState(null);

  // ---------- UI state ----------
  const [publishing, setPublishing] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [showBoostModal, setShowBoostModal] = useState(false);
  const [boostPostId, setBoostPostId] = useState(null);

  // ---------- Modal visibility ----------
  const [showFeelingModal, setShowFeelingModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [showMessengerModal, setShowMessengerModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [showLinkPreviewModal, setShowLinkPreviewModal] = useState(false);
  const [showABTestModal, setShowABTestModal] = useState(false);
  const [showMoreDropdown, setShowMoreDropdown] = useState(false);

  // ---------- Temporary modal inputs ----------
  const [tempWhatsAppNumber, setTempWhatsAppNumber] = useState('');
  const [tempCallNumber, setTempCallNumber] = useState('');
  const [tempLinkUrl, setTempLinkUrl] = useState('');
  const [tempAbVariants, setTempAbVariants] = useState(['', '', '', '']);
  const [tempAbDuration, setTempAbDuration] = useState(3);

  const textareaRef = useRef(null);

  const handleMediaSelected = (items) => {
    setMediaItems(items);
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setHashtags('');
    setMediaItems([]);
    setScheduledFor('');
    setShowSchedule(false);
    setIsAdPost(false);
    setPrivacy('public');
    setFeeling(null);
    setLocation(null);
    setCta(null);
    setLinkPreview(null);
    setAbTest(null);
    setSuccess(null);
    setError(null);
  };

  // Auto-select first page if only one exists
  useEffect(() => {
    if (pages.length === 1 && !pageId) {
      setPageId(pages[0].id);
    }
  }, [pages, pageId]);

  // ---------- Modal handlers ----------
  const selectFeeling = (emoji, name) => {
    setFeeling({ emoji, name });
    setShowFeelingModal(false);
  };

  const selectLocation = (locationName) => {
    setLocation(locationName);
    setShowLocationModal(false);
  };

  const saveWhatsApp = () => {
    if (!tempWhatsAppNumber.trim()) {
      alert('Please enter a phone number.');
      return;
    }
    setCta({ type: 'whatsapp', value: tempWhatsAppNumber });
    setShowWhatsAppModal(false);
    setTempWhatsAppNumber('');
  };

  const saveMessenger = () => {
    setCta({ type: 'messenger' });
    setShowMessengerModal(false);
  };

  const saveCall = () => {
    if (!tempCallNumber.trim()) {
      alert('Please enter a phone number.');
      return;
    }
    setCta({ type: 'call', value: tempCallNumber });
    setShowCallModal(false);
    setTempCallNumber('');
  };

  const saveLinkPreview = () => {
    if (!tempLinkUrl.trim()) {
      alert('Please enter a URL.');
      return;
    }
    setLinkPreview({
      url: tempLinkUrl,
      title: 'Example Title',
      description: 'Example description...',
      image: 'https://via.placeholder.com/120x120',
    });
    setShowLinkPreviewModal(false);
    setTempLinkUrl('');
  };

  const saveABTest = () => {
    const variants = tempAbVariants.filter((v) => v.trim() !== '');
    if (variants.length < 2) {
      alert('Please add at least two variants.');
      return;
    }
    setAbTest({ variants, duration: tempAbDuration });
    setShowABTestModal(false);
    setTempAbVariants(['', '', '', '']);
    setTempAbDuration(3);
  };

  // ---------- Publish / Draft ----------
  const handlePublish = async () => {
    if (!content.trim()) {
      setError('Post content is required');
      return;
    }
    if (!pageId) {
      setError('Please select a Facebook Page');
      return;
    }
    setPublishing(true);
    setError(null);
    setSuccess(null);
    try {
      const payload = {
        page_id: pageId,
        title: title || undefined,
        content,
        hashtags: hashtags || undefined,
        media_url: mediaItems.length > 0 ? mediaItems[0].url : null,
        media_type: mediaItems.length > 0 ? mediaItems[0].type : null,
        scheduled_for: showSchedule ? scheduledFor : undefined,
        publish_now: true,
        privacy,
        is_ad_post: isAdPost,
        feeling,
        location,
        cta,
        link_preview: linkPreview,
        ab_test: abTest,
        attached_media: mediaItems.map((item) => ({
          media_url: item.url,
          media_type: item.type,
        })),
      };
      const res = await facebookApi.createPost(payload);
      if (res.data.message === 'Post scheduled') {
        setSuccess(`Post scheduled for ${new Date(res.data.scheduled_for).toLocaleString()}`);
      } else {
        setSuccess(`Post published! Facebook ID: ${res.data.post_id}`);
        setBoostPostId(res.data.db_id);
      }
      resetForm();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to publish post');
    } finally {
      setPublishing(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!content.trim()) {
      setError('Post content is required');
      return;
    }
    if (!pageId) {
      setError('Please select a Facebook Page');
      return;
    }
    setSavingDraft(true);
    setError(null);
    setSuccess(null);
    try {
      const payload = {
        page_id: pageId,
        title: title || undefined,
        content,
        hashtags: hashtags || undefined,
        media_url: mediaItems.length > 0 ? mediaItems[0].url : null,
        media_type: mediaItems.length > 0 ? mediaItems[0].type : null,
        publish_now: false,
        privacy,
        is_ad_post: isAdPost,
        feeling,
        location,
        cta,
        link_preview: linkPreview,
        ab_test: abTest,
        attached_media: mediaItems.map((item) => ({
          media_url: item.url,
          media_type: item.type,
        })),
      };
      const res = await facebookApi.createPost(payload);
      setSuccess(`Post saved as draft! (ID: ${res.data.db_id})`);
      resetForm();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save draft');
    } finally {
      setSavingDraft(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Discard this post? All unsaved changes will be lost.')) {
      resetForm();
      setError(null);
      setSuccess(null);
    }
  };

  const handleBoostClick = () => {
    if (boostPostId) {
      setShowBoostModal(true);
    } else {
      alert('Please publish the post first before boosting.');
    }
  };

  if (pagesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const selectedPage = pages.find((p) => p.id === pageId);

  // ---------- Feeling options ----------
  const feelingOptions = [
    { emoji: '🥰', name: 'happy' },
    { emoji: '😢', name: 'sad' },
    { emoji: '😍', name: 'in love' },
    { emoji: '🙏', name: 'grateful' },
    { emoji: '🤩', name: 'excited' },
    { emoji: '🥳', name: 'party' },
    { emoji: '😎', name: 'cool' },
    { emoji: '😴', name: 'sleepy' },
    { emoji: '🤔', name: 'thinking' },
    { emoji: '😊', name: 'smiling' },
  ];

  const locationOptions = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia'];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-8">
        Create Post
      </h1>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* ============ LEFT PANEL – COMPOSER ============ */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
          <div className="p-6">
            {/* Ad post hint */}
            <div className="flex justify-end mb-4">
              <div className="text-sm">
                <span className="text-gray-600">Want to create an ad post? </span>
                <a href="#" className="text-blue-600 hover:underline">
                  See more →
                </a>
              </div>
            </div>

            {/* Post to – custom dropdown with avatar */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">Post to</label>
              <div className="relative">
                <select
                  value={pageId || ''}
                  onChange={(e) => setPageId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 bg-white appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a page</option>
                  {pages.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name || `Page ${p.page_id}`}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {selectedPage && (
                <div className="flex items-center mt-2 text-sm text-gray-600">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold mr-2 text-xs">
                    {selectedPage?.name?.charAt(0) || 'P'}
                  </div>
                  <span>{selectedPage.name || `Page ${selectedPage.page_id}`}</span>
                </div>
              )}
            </div>

            {/* Media */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">Media</label>
              <MediaUploader existingMedia={mediaItems} onMediaSelected={handleMediaSelected} />
              {mediaItems.length > 0 && (
                <p className="text-xs text-green-600 mt-1">{mediaItems.length} media item(s) selected</p>
              )}
            </div>

            {/* Post details – Make this an ad post toggle */}
            <div className="mb-5">
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAdPost}
                    onChange={() => setIsAdPost(!isAdPost)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
                <span className="text-sm font-medium text-gray-700">Make this an ad post</span>
              </div>
            </div>

            {/* Add to your post */}
            <div className="mb-5">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Add to your post</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setShowFeelingModal(true)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm px-3 py-1.5 rounded-full flex items-center gap-1 transition"
                >
                  <i className="fas fa-smile text-yellow-500"></i> Feeling/activity
                </button>
                <button
                  onClick={() => setShowLocationModal(true)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm px-3 py-1.5 rounded-full flex items-center gap-1 transition"
                >
                  <i className="fas fa-map-marker-alt text-red-500"></i> Location
                </button>
                <button
                  onClick={() => setShowMessengerModal(true)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm px-3 py-1.5 rounded-full flex items-center gap-1 transition"
                >
                  <i className="fab fa-facebook-messenger text-blue-600"></i> Get messages
                </button>
                <button
                  onClick={() => setShowWhatsAppModal(true)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm px-3 py-1.5 rounded-full flex items-center gap-1 transition"
                >
                  <i className="fab fa-whatsapp text-green-600"></i> Get WhatsApp messages
                </button>
                <button
                  onClick={() => setShowCallModal(true)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm px-3 py-1.5 rounded-full flex items-center gap-1 transition"
                >
                  <i className="fas fa-phone-alt text-green-700"></i> Get calls
                </button>
                <div className="relative">
                  <button
                    onClick={() => setShowMoreDropdown(!showMoreDropdown)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm px-3 py-1.5 rounded-full flex items-center gap-1 transition"
                  >
                    <i className="fas fa-ellipsis-h"></i> More
                  </button>
                  {showMoreDropdown && (
                    <div className="absolute left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                      <button
                        onClick={() => {
                          setShowMoreDropdown(false);
                          setShowLinkPreviewModal(true);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition"
                      >
                        <i className="fas fa-link text-blue-400 mr-2"></i> Link preview
                      </button>
                      <button
                        onClick={() => {
                          setShowMoreDropdown(false);
                          setShowABTestModal(true);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition"
                      >
                        <i className="fas fa-chart-line text-purple-500 mr-2"></i> A/B test
                      </button>
                    </div>
                  )}
                </div>
              </div>
              {/* Display selected badges */}
              <div className="mt-2 flex flex-wrap gap-2">
                {feeling && (
                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                    {feeling.emoji} {feeling.name}
                  </span>
                )}
                {location && (
                  <span className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded-full">📍 {location}</span>
                )}
                {cta && cta.type === 'whatsapp' && (
                  <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">
                    <i className="fab fa-whatsapp mr-1"></i> WhatsApp: {cta.value}
                  </span>
                )}
                {cta && cta.type === 'messenger' && (
                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                    <i className="fab fa-facebook-messenger mr-1"></i> Messenger
                  </span>
                )}
                {cta && cta.type === 'call' && (
                  <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">
                    <i className="fas fa-phone-alt mr-1"></i> Call: {cta.value}
                  </span>
                )}
                {linkPreview && (
                  <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full">
                    <i className="fas fa-link mr-1"></i> Link preview
                  </span>
                )}
                {abTest && (
                  <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full">
                    <i className="fas fa-chart-line mr-1"></i> A/B Test ({abTest.variants.length} variants)
                  </span>
                )}
              </div>
            </div>

            {/* Text */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">Text</label>
              <textarea
                ref={textareaRef}
                rows="5"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
                placeholder="What's on your mind?"
              />
            </div>

            {/* Hashtags */}
            <div className="mb-5">
              <HashtagInput value={hashtags} onChange={setHashtags} />
            </div>

            {/* Schedule – toggle + datetime picker */}
            <div className="mb-5">
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showSchedule}
                    onChange={() => setShowSchedule(!showSchedule)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
                <span className="text-sm font-medium text-gray-700">Set date and time</span>
              </div>
              {showSchedule && (
                <input
                  type="datetime-local"
                  value={scheduledFor}
                  onChange={(e) => setScheduledFor(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 mt-2"
                />
              )}
            </div>

            {/* Share to – shows page name and story/privacy */}
            <div className="mb-5 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-700">Share to</span>
                  <div className="text-sm text-gray-600 flex items-center gap-1">
                    {selectedPage ? (
                      <>
                        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs">
                          {selectedPage?.name?.charAt(0) || 'P'}
                        </div>
                        <span>{selectedPage.name || `Page ${selectedPage.page_id}`}</span>
                      </>
                    ) : (
                      <span>Select a page</span>
                    )}
                    <span className="mx-1">·</span>
                    <span>Facebook story</span>
                    <span className="mx-1">·</span>
                    <span>{privacy === 'public' ? 'Public' : 'Restricted'}</span>
                  </div>
                </div>
                <span className="text-xs text-gray-400">🔒</span>
              </div>
            </div>

            {/* Privacy settings */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">Privacy settings</label>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    id="public"
                    name="privacy"
                    value="public"
                    checked={privacy === 'public'}
                    onChange={() => setPrivacy('public')}
                    className="mt-1"
                  />
                  <div>
                    <label htmlFor="public" className="font-medium text-gray-700">
                      Public
                    </label>
                    <p className="text-xs text-gray-500">Anyone on or off Facebook will be able to see your post.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    id="restricted"
                    name="privacy"
                    value="restricted"
                    checked={privacy === 'restricted'}
                    onChange={() => setPrivacy('restricted')}
                    className="mt-1"
                  />
                  <div>
                    <label htmlFor="restricted" className="font-medium text-gray-700">
                      Restricted
                    </label>
                    <p className="text-xs text-gray-500">Choose certain people on Facebook who can see your post.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={handleBoostClick}
                className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow transition"
              >
                Boost
              </button>
              <button
                onClick={handleCancel}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDraft}
                disabled={savingDraft}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition disabled:opacity-50"
              >
                {savingDraft ? 'Saving...' : 'Finish later'}
              </button>
              <button
                onClick={handlePublish}
                disabled={publishing}
                className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow transition disabled:opacity-50 ml-auto"
              >
                {publishing
                  ? showSchedule && scheduledFor
                    ? 'Scheduling...'
                    : 'Publishing...'
                  : showSchedule && scheduledFor
                  ? 'Schedule'
                  : 'Publish'}
              </button>
            </div>

            {error && <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">{error}</div>}
            {success && (
              <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-lg border border-green-200">{success}</div>
            )}
          </div>
        </div>

        {/* ============ RIGHT PANEL – PREVIEW ============ */}
        <div>
          <h2 className="text-xl font-semibold mb-3">Facebook Feed preview</h2>
          <PostPreview
            title={title}
            content={content}
            hashtags={hashtags}
            media={mediaItems}
            pageName={selectedPage?.name || 'Page'}
            privacy={privacy}
            feeling={feeling}
            location={location}
            cta={cta}
            linkPreview={linkPreview}
            abTest={abTest}
          />
        </div>
      </div>

      {/* ============ MODALS ============ */}

      {/* Feeling Modal */}
      {showFeelingModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowFeelingModal(false)}
        >
          <div className="bg-white rounded-xl w-96 max-w-full p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b pb-2 mb-3">
              <h3 className="text-lg font-semibold">How are you feeling?</h3>
              <button onClick={() => setShowFeelingModal(false)} className="text-gray-500 hover:text-gray-700">
                &times;
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1 max-h-64 overflow-y-auto">
              {feelingOptions.map((f) => (
                <div
                  key={f.name}
                  onClick={() => selectFeeling(f.emoji, f.name)}
                  className="p-2 rounded flex items-center gap-2 cursor-pointer hover:bg-gray-100"
                >
                  <span className="text-xl">{f.emoji}</span> {f.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Location Modal */}
      {showLocationModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowLocationModal(false)}
        >
          <div className="bg-white rounded-xl w-96 max-w-full p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b pb-2 mb-3">
              <h3 className="text-lg font-semibold">Add Location</h3>
              <button onClick={() => setShowLocationModal(false)} className="text-gray-500 hover:text-gray-700">
                &times;
              </button>
            </div>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {locationOptions.map((loc) => (
                <div
                  key={loc}
                  onClick={() => selectLocation(loc)}
                  className="p-2 hover:bg-gray-100 cursor-pointer rounded"
                >
                  📍 {loc}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Modal */}
      {showWhatsAppModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowWhatsAppModal(false)}
        >
          <div className="bg-white rounded-xl w-96 max-w-full p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b pb-2 mb-3">
              <h3 className="text-lg font-semibold">
                <i className="fab fa-whatsapp text-green-600 mr-2"></i> Get WhatsApp messages
              </h3>
              <button onClick={() => setShowWhatsAppModal(false)} className="text-gray-500 hover:text-gray-700">
                &times;
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-3">Add your WhatsApp number so people can message you directly.</p>
            <input
              type="tel"
              placeholder="+91 XXXXX XXXXX"
              value={tempWhatsAppNumber}
              onChange={(e) => setTempWhatsAppNumber(e.target.value)}
              className="w-full border rounded-lg p-2 mb-4"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowWhatsAppModal(false)} className="px-4 py-1 border rounded">
                Cancel
              </button>
              <button onClick={saveWhatsApp} className="px-4 py-1 bg-green-600 text-white rounded">
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messenger Modal */}
      {showMessengerModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowMessengerModal(false)}
        >
          <div className="bg-white rounded-xl w-96 max-w-full p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b pb-2 mb-3">
              <h3 className="text-lg font-semibold">
                <i className="fab fa-facebook-messenger text-blue-600 mr-2"></i> Get messages
              </h3>
              <button onClick={() => setShowMessengerModal(false)} className="text-gray-500 hover:text-gray-700">
                &times;
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-3">Add a "Send Message" button to your post.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowMessengerModal(false)} className="px-4 py-1 border rounded">
                Cancel
              </button>
              <button onClick={saveMessenger} className="px-4 py-1 bg-blue-600 text-white rounded">
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Call Modal */}
      {showCallModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowCallModal(false)}
        >
          <div className="bg-white rounded-xl w-96 max-w-full p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b pb-2 mb-3">
              <h3 className="text-lg font-semibold">
                <i className="fas fa-phone-alt text-green-700 mr-2"></i> Get calls
              </h3>
              <button onClick={() => setShowCallModal(false)} className="text-gray-500 hover:text-gray-700">
                &times;
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-3">Add a "Call Now" button to your post.</p>
            <input
              type="tel"
              placeholder="+1 234 567 890"
              value={tempCallNumber}
              onChange={(e) => setTempCallNumber(e.target.value)}
              className="w-full border rounded-lg p-2 mb-4"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowCallModal(false)} className="px-4 py-1 border rounded">
                Cancel
              </button>
              <button onClick={saveCall} className="px-4 py-1 bg-green-600 text-white rounded">
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Link Preview Modal */}
      {showLinkPreviewModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowLinkPreviewModal(false)}
        >
          <div className="bg-white rounded-xl w-96 max-w-full p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b pb-2 mb-3">
              <h3 className="text-lg font-semibold">
                <i className="fas fa-link text-blue-400 mr-2"></i> Link preview
              </h3>
              <button onClick={() => setShowLinkPreviewModal(false)} className="text-gray-500 hover:text-gray-700">
                &times;
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-3">Paste a URL to automatically generate a preview card.</p>
            <input
              type="url"
              placeholder="https://example.com"
              value={tempLinkUrl}
              onChange={(e) => setTempLinkUrl(e.target.value)}
              className="w-full border rounded-lg p-2 mb-4"
            />
            <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-gray-300 rounded flex-shrink-0"></div>
                <div>
                  <div className="font-medium text-sm">Example Title</div>
                  <div className="text-xs text-gray-500">Example description...</div>
                  <div className="text-xs text-blue-600">example.com</div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowLinkPreviewModal(false)} className="px-4 py-1 border rounded">
                Cancel
              </button>
              <button onClick={saveLinkPreview} className="px-4 py-1 bg-blue-600 text-white rounded">
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* A/B Test Modal */}
      {showABTestModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowABTestModal(false)}
        >
          <div className="bg-white rounded-xl w-96 max-w-full p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b pb-2 mb-3">
              <h3 className="text-lg font-semibold">
                <i className="fas fa-chart-line text-purple-500 mr-2"></i> A/B Test
              </h3>
              <button onClick={() => setShowABTestModal(false)} className="text-gray-500 hover:text-gray-700">
                &times;
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-3">Test up to 4 variants to see which performs best.</p>
            <div className="space-y-2">
              {tempAbVariants.map((v, i) => (
                <input
                  key={i}
                  type="text"
                  placeholder={`Variant ${String.fromCharCode(65 + i)}`}
                  value={v}
                  onChange={(e) => {
                    const newArr = [...tempAbVariants];
                    newArr[i] = e.target.value;
                    setTempAbVariants(newArr);
                  }}
                  className="w-full border rounded-lg p-2 text-sm"
                />
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Test duration (days)</label>
                <input
                  type="number"
                  value={tempAbDuration}
                  onChange={(e) => setTempAbDuration(parseInt(e.target.value) || 1)}
                  className="w-full border rounded-lg p-2 text-sm"
                  min="1"
                  max="7"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setShowABTestModal(false)} className="px-4 py-1 border rounded">
                Cancel
              </button>
              <button onClick={saveABTest} className="px-4 py-1 bg-purple-600 text-white rounded">
                Start Test
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Boost Modal */}
      {showBoostModal && boostPostId && (
        <BoostModal
          post={{ id: boostPostId }}
          onClose={() => setShowBoostModal(false)}
          onBoostCreated={() => {
            setShowBoostModal(false);
            alert('Boost campaign created successfully!');
          }}
        />
      )}
    </div>
  );
}