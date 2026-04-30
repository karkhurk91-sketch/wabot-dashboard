import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { campaignApi } from '../services/campaignApi';
import CreativeSelector from '../components/CreativeSelector';
import WhatsAppLink from '../components/WhatsAppLink';
import AdKit from '../components/AdKit';

export default function CampaignDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Core data
  const [campaign, setCampaign] = useState(null);
  const [creatives, setCreatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [contentTypes, setContentTypes] = useState(['text', 'image']);

  // Selections
  const [selectedTextId, setSelectedTextId] = useState(null);
  const [selectedImageId, setSelectedImageId] = useState(null);

  // Post composition
  const [editableCaption, setEditableCaption] = useState('');
  const [postTags, setPostTags] = useState('');
  const [suggestedTags, setSuggestedTags] = useState([]);
  const [whatsappLink, setWhatsappLink] = useState('');
  const [useWhatsappCta, setUseWhatsappCta] = useState(true);
  const [customCtaUrl, setCustomCtaUrl] = useState('');
  const [secondaryCtaUrl, setSecondaryCtaUrl] = useState('');
  const [secondaryCtaText, setSecondaryCtaText] = useState('More Info');
  const [posting, setPosting] = useState(false);
  const [postResult, setPostResult] = useState(null);
  const [generatingTags, setGeneratingTags] = useState(false);

  // Facebook Ad Campaign state
  const [adBudget, setAdBudget] = useState(500); // ₹5 daily
  const [adTargetingLocation, setAdTargetingLocation] = useState('');
  const [adAgeMin, setAdAgeMin] = useState(18);
  const [adAgeMax, setAdAgeMax] = useState(65);
  const [leadQuestions, setLeadQuestions] = useState([
    { key: 'full_name', label: 'Full Name', type: 'CUSTOM' },
    { key: 'email', label: 'Email Address', type: 'CUSTOM' },
    { key: 'phone', label: 'Phone Number', type: 'CUSTOM' }
  ]);
  const [creatingAd, setCreatingAd] = useState(false);
  const [adCampaignResult, setAdCampaignResult] = useState(null);

  // UI steps
  const [step, setStep] = useState(1);

  useEffect(() => {
    loadCampaign();
    loadCreatives();
  }, [id]);

  const loadCampaign = async () => {
    try {
      const res = await campaignApi.getOne(id);
      setCampaign(res.data);
    } catch (err) {
      console.error(err);
      navigate('/campaigns');
    }
  };

  const loadCreatives = async () => {
    try {
      const res = await campaignApi.getCreatives(id);
      setCreatives(res.data);
      const textCreative = res.data.find(c => c.type === 'text');
      const imageCreative = res.data.find(c => c.type === 'image');
      if (textCreative && !selectedTextId) {
        setSelectedTextId(textCreative.id);
        setEditableCaption(textCreative.content);
      }
      if (imageCreative && !selectedImageId) {
        setSelectedImageId(imageCreative.id);
      }
      if (res.data.length > 0 && step === 1) setStep(2);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectedText = creatives.find(c => c.id === selectedTextId);
  const selectedImage = creatives.find(c => c.id === selectedImageId);
  const selectedImageUrl = selectedImage?.media_url || null;

  useEffect(() => {
    if (selectedText && campaign) {
      setEditableCaption(selectedText.content);
      generateTagSuggestions(selectedText.content);
    }
  }, [selectedText, campaign]);

  const generateTagSuggestions = async (captionText) => {
    if (!captionText?.trim()) return;
    setGeneratingTags(true);
    try {
      const res = await campaignApi.suggestTags({
        text: captionText,
        product_name: campaign?.product_name || '',
        location: campaign?.location || '',
        industry: campaign?.business_type || 'general',
      });
      const tagsArr = res.data.tags.split(',').map(t => t.trim());
      setSuggestedTags(tagsArr);
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingTags(false);
    }
  };

  const addTag = (tag) => {
    const current = postTags.trim();
    setPostTags(current ? `${current} ${tag}` : tag);
  };

  const handleGenerateContent = async () => {
    if (generating || contentTypes.length === 0) return;
    setGenerating(true);
    try {
      await campaignApi.generateContent(id, { content_types: contentTypes });
      await loadCreatives();
      setStep(2);
    } catch (err) {
      console.error(err);
      alert('Content generation failed.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSelectText = (creativeId) => setSelectedTextId(creativeId);
  const handleSelectImage = (creativeId) => setSelectedImageId(creativeId);
  const toggleContentType = (type) => {
    setContentTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  const handleWhatsappGenerated = (link) => {
    setWhatsappLink(link);
    if (useWhatsappCta) setCustomCtaUrl(link);
  };

  const handlePostToFacebook = async () => {
    if (!selectedText && !selectedImage) {
      alert('Please select at least a text or an image.');
      return;
    }
    let finalMessage = editableCaption;
    if (postTags) finalMessage += `\n\n${postTags}`;
    const primary = useWhatsappCta ? whatsappLink : customCtaUrl;
    if (primary) finalMessage += `\n\n👉 Contact us: ${primary}`;
    if (secondaryCtaUrl) finalMessage += `\n\n${secondaryCtaText}: ${secondaryCtaUrl}`;

    setPosting(true);
    try {
      const res = await campaignApi.postToFacebook(id, {
        message: finalMessage,
        media_url: selectedImageUrl,
      });
      setPostResult(res.data);
      alert('Posted successfully!');
    } catch (err) {
      alert('Post failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setPosting(false);
    }
  };

  const handleCreateAdCampaign = async () => {
    if (!selectedImageUrl) {
      alert('Please select an image creative first (ad requires an image).');
      return;
    }
    setCreatingAd(true);
    try {
      const targeting = {
        geo_locations: adTargetingLocation ? { cities: [{ name: adTargetingLocation }] } : { countries: ['IN'] },
        age_min: adAgeMin,
        age_max: adAgeMax
      };
      const dailyBudgetPaise = adBudget * 100;
      const fbLeadQuestions = leadQuestions.map(q => ({
        key: q.key || q.label.toLowerCase().replace(/\s/g, '_'),
        label: q.label,
        type: q.type
      }));
      const storySpec = {
        page_id: '', // will be filled by backend
        link_data: {
          message: editableCaption,
          link: useWhatsappCta ? whatsappLink : customCtaUrl || '',
          call_to_action: { type: 'LEARN_MORE' }
        }
      };
      if (selectedImageUrl) storySpec.link_data.image_url = selectedImageUrl;

      const res = await campaignApi.createAdCampaign(id, {
        platform: 'facebook',
        name: `Ad for ${campaign.name}`,
        daily_budget: dailyBudgetPaise,
        targeting: targeting,
        lead_form_questions: fbLeadQuestions,
        story_spec: storySpec,
        start_time: new Date().toISOString()
      });
      setAdCampaignResult(res.data);
      alert('Ad campaign created! Check Facebook Ads Manager.');
    } catch (err) {
      alert('Failed to create ad campaign: ' + (err.response?.data?.detail || err.message));
    } finally {
      setCreatingAd(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div></div>;
  if (!campaign) return <div className="text-center text-red-600 p-6">Campaign not found</div>;

  const textCreatives = creatives.filter(c => c.type === 'text');
  const imageCreatives = creatives.filter(c => c.type === 'image');

  const StepIndicator = ({ number, label, active, completed, onClick }) => (
    <div className="flex flex-col items-center flex-1 cursor-pointer" onClick={onClick}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold transition-all duration-200 ${active ? 'bg-indigo-600 ring-4 ring-indigo-200' : completed ? 'bg-green-500' : 'bg-gray-300'}`}>
        {completed ? '✓' : number}
      </div>
      <span className={`text-xs mt-2 font-medium ${active ? 'text-indigo-600' : 'text-gray-500'}`}>{label}</span>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{campaign.name}</h1>
        <p className="text-gray-500 mt-2">Product: <span className="font-medium">{campaign.product_name}</span> | Price: <span className="font-medium">{campaign.price}</span> | Location: <span className="font-medium">{campaign.location}</span></p>
      </div>

      {/* Step Progress Bar */}
      <div className="flex justify-between items-center mb-10 max-w-2xl mx-auto">
        <StepIndicator number={1} label="Generate" active={step === 1} completed={step > 1} onClick={() => step > 1 && setStep(1)} />
        <div className="flex-1 h-0.5 bg-gray-200 mx-2"></div>
        <StepIndicator number={2} label="Select" active={step === 2} completed={step > 2} onClick={() => step > 2 && setStep(2)} />
        <div className="flex-1 h-0.5 bg-gray-200 mx-2"></div>
        <StepIndicator number={3} label="Tags & Link" active={step === 3} completed={step > 3} onClick={() => step > 3 && setStep(3)} />
        <div className="flex-1 h-0.5 bg-gray-200 mx-2"></div>
        <StepIndicator number={4} label="Preview & Publish" active={step === 4} completed={step > 4} />
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2"><span className="bg-indigo-100 text-indigo-700 w-8 h-8 rounded-full inline-flex items-center justify-center text-sm font-bold">1</span> Generate AI Content</h2>
          <div className="mb-6 flex gap-6">
            {['text', 'image'].map(type => (
              <label key={type} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={contentTypes.includes(type)} onChange={() => toggleContentType(type)} className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500" />
                <span className="capitalize font-medium">{type}</span>
              </label>
            ))}
          </div>
          {creatives.length > 0 ? (
            <div className="bg-green-50 rounded-xl p-4 text-green-700 flex items-center gap-2">
              <span>✅</span> Already generated ({creatives.length} items). You can proceed or generate again.
            </div>
          ) : (
            <button onClick={handleGenerateContent} disabled={generating || contentTypes.length === 0} className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition disabled:opacity-50">
              {generating ? <span className="flex items-center gap-2"><span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span> Generating...</span> : 'Generate Selected Content'}
            </button>
          )}
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (textCreatives.length > 0 || imageCreatives.length > 0) && (
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold flex items-center gap-2"><span className="bg-indigo-100 text-indigo-700 w-8 h-8 rounded-full inline-flex items-center justify-center text-sm font-bold">2</span> Choose Your Post Content</h2>
            <button onClick={() => setStep(1)} className="text-sm text-gray-500 hover:text-indigo-600">← Back</button>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {textCreatives.length > 0 && (
              <div>
                <h3 className="font-medium text-lg mb-3 flex items-center gap-2">📝 Select a Caption</h3>
                <CreativeSelector creatives={textCreatives} selectedId={selectedTextId} onSelect={handleSelectText} />
              </div>
            )}
            {imageCreatives.length > 0 && (
              <div>
                <h3 className="font-medium text-lg mb-3 flex items-center gap-2">🖼️ Select an Image</h3>
                <CreativeSelector creatives={imageCreatives} selectedId={selectedImageId} onSelect={handleSelectImage} />
              </div>
            )}
          </div>
          {selectedTextId && selectedImageId && (
            <button onClick={() => setStep(3)} className="mt-8 bg-green-600 text-white px-6 py-3 rounded-xl font-medium shadow-md hover:bg-green-700 transition">Continue to Tags & Link →</button>
          )}
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && selectedTextId && selectedImageId && (
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold flex items-center gap-2"><span className="bg-indigo-100 text-indigo-700 w-8 h-8 rounded-full inline-flex items-center justify-center text-sm font-bold">3</span> Hashtags & WhatsApp Link</h2>
            <button onClick={() => setStep(2)} className="text-sm text-gray-500 hover:text-indigo-600">← Back</button>
          </div>
          <div>
            <label className="block font-medium mb-2">✏️ Edit Caption</label>
            <textarea value={editableCaption} onChange={(e) => setEditableCaption(e.target.value)} rows="3" className="w-full border rounded-xl p-3 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm" />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="font-medium">💡 Suggested Hashtags</label>
              <button onClick={() => generateTagSuggestions(editableCaption)} disabled={generatingTags} className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full transition">{generatingTags ? 'Loading...' : 'Refresh'}</button>
            </div>
            {suggestedTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {suggestedTags.map(tag => (
                  <button key={tag} onClick={() => addTag(tag)} className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm hover:bg-blue-100 transition">{tag}</button>
                ))}
              </div>
            )}
            <label className="block text-sm font-medium mb-1">Your Hashtags (edit or add)</label>
            <input type="text" value={postTags} onChange={(e) => setPostTags(e.target.value)} placeholder="#example #sale" className="w-full border rounded-xl p-3 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block font-medium mb-2">🔗 WhatsApp Link (Primary CTA)</label>
            <WhatsAppLink campaignId={id} onGenerated={handleWhatsappGenerated} />
            {whatsappLink && (
              <div className="mt-2 text-sm bg-gray-50 p-2 rounded flex items-center justify-between">
                <span className="text-green-700 truncate">{whatsappLink}</span>
                <button onClick={() => navigator.clipboard.writeText(whatsappLink)} className="text-blue-600 underline text-xs">Copy</button>
              </div>
            )}
          </div>
          <button
            onClick={() => setStep(4)}
            className={`w-full bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium shadow-md transition ${!whatsappLink ? 'opacity-50 ' : 'hover:bg-indigo-700'}`}
          >
            Preview Post →
          </button>
        </div>
      )}

      {/* Step 4 */}
      {step === 4 && selectedTextId && selectedImageId && (
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold flex items-center gap-2"><span className="bg-indigo-100 text-indigo-700 w-8 h-8 rounded-full inline-flex items-center justify-center text-sm font-bold">4</span> Preview & Publish</h2>
            <button onClick={() => setStep(3)} className="text-sm text-gray-500 hover:text-indigo-600">← Back to edit</button>
          </div>

          {/* Live editable preview */}
          <div className="border rounded-xl overflow-hidden bg-gray-50 shadow-inner p-4">
            <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
              {selectedImageUrl && <img src={selectedImageUrl} alt="Post visual" className="w-full h-auto" />}
              <div className="p-4 space-y-3">
                <textarea
                  value={editableCaption}
                  onChange={(e) => setEditableCaption(e.target.value)}
                  rows="3"
                  className="w-full text-gray-800 text-sm border rounded p-2 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  value={postTags}
                  onChange={(e) => setPostTags(e.target.value)}
                  placeholder="Hashtags #example"
                  className="w-full text-blue-500 text-sm border rounded p-2"
                />
                <div className="flex flex-wrap gap-2 pt-2">
                  <div className="w-full text-sm mb-2 flex items-center gap-3">
                    <label className="flex items-center gap-1">
                      <input type="checkbox" checked={useWhatsappCta} onChange={(e) => setUseWhatsappCta(e.target.checked)} />
                      Use WhatsApp link
                    </label>
                    <span className="text-gray-400">|</span>
                    <label className="flex items-center gap-1">
                      <input type="checkbox" checked={!useWhatsappCta} onChange={() => setUseWhatsappCta(false)} />
                      Use custom link
                    </label>
                  </div>
                  {useWhatsappCta && whatsappLink && (
                    <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1.5 rounded-full transition">📱 Chat on WhatsApp</a>
                  )}
                  {!useWhatsappCta && (
                    <div className="w-full">
                      <input
                        type="url"
                        value={customCtaUrl}
                        onChange={(e) => setCustomCtaUrl(e.target.value)}
                        placeholder="Custom CTA URL (e.g., https://wa.me/...)"
                        className="w-full border rounded p-2 text-sm"
                      />
                    </div>
                  )}
                  {secondaryCtaUrl && (
                    <a href={secondaryCtaUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded-full transition">{secondaryCtaText}</a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Secondary CTA editor */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <label className="block text-sm font-medium">➕ Optional Secondary CTA (website, booking link)</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input type="text" value={secondaryCtaText} onChange={(e) => setSecondaryCtaText(e.target.value)} placeholder="Button text" className="sm:w-1/3 border rounded-lg p-2" />
              <input type="url" value={secondaryCtaUrl} onChange={(e) => setSecondaryCtaUrl(e.target.value)} placeholder="https://example.com" className="flex-1 border rounded-lg p-2" />
            </div>
          </div>

          <button onClick={handlePostToFacebook} disabled={posting} className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition disabled:opacity-50">
            {posting ? <span className="flex items-center justify-center gap-2"><span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span> Publishing...</span> : 'Publish to Facebook / Instagram'}
          </button>
          {postResult && <div className="text-center text-green-600">✅ Posted! Post ID: {postResult.post_id}</div>}
        </div>
      )}

      {/* Step 5 – Facebook Ad Campaign (shown only after Step 4 and an image is selected) */}
      {step === 4 && selectedImageUrl && (
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 mt-8">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <span className="bg-purple-100 text-purple-700 w-8 h-8 rounded-full inline-flex items-center justify-center text-sm font-bold">5</span>
            Boost with Facebook Ads
          </h2>
          <p className="text-gray-500 text-sm mb-4">
            Turn this post into a Facebook lead generation ad. Reach more people and capture leads directly.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Daily Budget (₹)</label>
              <input
                type="number"
                value={adBudget}
                onChange={(e) => setAdBudget(parseInt(e.target.value) || 0)}
                className="w-full border rounded-lg p-2"
                min="100"
                step="50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Targeting (City/Region) – optional</label>
              <input
                type="text"
                value={adTargetingLocation}
                onChange={(e) => setAdTargetingLocation(e.target.value)}
                placeholder="e.g., Indore, India"
                className="w-full border rounded-lg p-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Min Age</label>
                <input type="number" value={adAgeMin} onChange={(e) => setAdAgeMin(parseInt(e.target.value))} className="border rounded-lg p-2 w-full" min="13" max="100" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Max Age</label>
                <input type="number" value={adAgeMax} onChange={(e) => setAdAgeMax(parseInt(e.target.value))} className="border rounded-lg p-2 w-full" min="13" max="100" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Lead Form Questions</label>
              {leadQuestions.map((q, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={q.label}
                    onChange={(e) => {
                      const newQuestions = [...leadQuestions];
                      newQuestions[idx].label = e.target.value;
                      setLeadQuestions(newQuestions);
                    }}
                    className="flex-1 border rounded p-2"
                    placeholder="Question label"
                  />
                  <select
                    value={q.type}
                    onChange={(e) => {
                      const newQuestions = [...leadQuestions];
                      newQuestions[idx].type = e.target.value;
                      setLeadQuestions(newQuestions);
                    }}
                    className="border rounded p-2"
                  >
                    <option value="CUSTOM">Short Answer</option>
                    <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                  </select>
                  <button
                    onClick={() => setLeadQuestions(leadQuestions.filter((_, i) => i !== idx))}
                    className="text-red-500 px-2"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                onClick={() => setLeadQuestions([...leadQuestions, { key: `custom_${leadQuestions.length + 1}`, label: 'New Question', type: 'CUSTOM' }])}
                className="text-indigo-600 text-sm"
              >
                + Add Question
              </button>
            </div>

            <button
              onClick={handleCreateAdCampaign}
              disabled={creatingAd}
              className="w-full bg-purple-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-purple-700 transition disabled:opacity-50"
            >
              {creatingAd ? 'Creating Ad Campaign...' : 'Create Facebook Lead Ad Campaign'}
            </button>

            {adCampaignResult && (
              <div className="text-green-600 text-sm mt-2">
                ✅ Campaign created! Campaign ID: {adCampaignResult.campaign_id}<br />
                Ad ID: {adCampaignResult.ad_id}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}