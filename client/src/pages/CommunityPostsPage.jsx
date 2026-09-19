import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import postService from '../services/postService';
import uploadService from '../services/uploadService';
import Loader from '../components/common/Loader';
import {
  Heart,
  MessageSquare,
  Bookmark,
  Share2,
  Plus,
  MapPin,
  Send,
  Image as ImageIcon,
  X,
  Search,
  Sparkles,
  Filter,
} from 'lucide-react';

export default function CommunityPostsPage() {
  const { user: currentUser } = useAuth();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // New post form states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [content, setContent] = useState('');
  const [destination, setDestination] = useState('');
  const [imageFiles, setImageFiles] = useState([]); // Array of base64 or file previews
  const [imageUrls, setImageUrls] = useState([]); // Uploaded Cloudinary URLs
  const [uploading, setUploading] = useState(false);
  const [commentTextMap, setCommentTextMap] = useState({});

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const data = await postService.getPosts();
      setPosts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMultipleImagesUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (imageFiles.length + files.length > 5) {
      alert('Maximum 5 images allowed per post.');
      return;
    }

    setUploading(true);
    const newPreviews = [];
    const uploadPromises = files.map(
      (file) =>
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            newPreviews.push(reader.result);
            resolve(reader.result);
          };
          reader.readAsDataURL(file);
        })
    );

    const base64Images = await Promise.all(uploadPromises);

    try {
      const res = await uploadService.uploadImage({ images: base64Images });
      if (res.urls && res.urls.length > 0) {
        setImageUrls((prev) => [...prev, ...res.urls].slice(0, 5));
        setImageFiles((prev) => [...prev, ...base64Images].slice(0, 5));
      }
    } catch (err) {
      alert('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      const newPost = await postService.createPost({
        content: content.trim(),
        destination: destination.trim() || 'General',
        images: imageUrls,
        tags: [destination.trim() || 'Travel', selectedCategory !== 'All' ? selectedCategory : 'Experience'],
      });

      setPosts([newPost, ...posts]);
      setShowCreateModal(false);
      setContent('');
      setDestination('');
      setImageFiles([]);
      setImageUrls([]);
    } catch (err) {
      alert('Failed to create post');
    }
  };

  const handleLike = async (postId) => {
    try {
      const updated = await postService.likePost(postId);
      setPosts(posts.map((p) => (p._id === postId ? updated : p)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSavePost = async (postId) => {
    try {
      const updated = await postService.savePost(postId);
      setPosts(posts.map((p) => (p._id === postId ? updated : p)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (postId) => {
    const text = commentTextMap[postId];
    if (!text || !text.trim()) return;

    try {
      const updated = await postService.commentPost(postId, text.trim());
      setPosts(posts.map((p) => (p._id === postId ? updated : p)));
      setCommentTextMap({ ...commentTextMap, [postId]: '' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = (post) => {
    navigator.clipboard.writeText(window.location.href);
    alert('Post link copied to clipboard!');
  };

  const categories = ['All', 'Photos', 'Travel Tips', 'Experiences', 'Destinations'];

  // Filter & Search logic
  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      !searchQuery ||
      post.destination?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content?.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedCategory === 'All') return matchesSearch;
    if (selectedCategory === 'Photos') return matchesSearch && post.images && post.images.length > 0;
    if (selectedCategory === 'Destinations') return matchesSearch && post.destination && post.destination !== 'General';
    return matchesSearch && (post.tags || []).includes(selectedCategory);
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-slate-900 border border-slate-800 p-8 rounded-3xl text-white shadow-xl">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Travel Community</span>
          <h1 className="text-3xl font-black">Share journeys, experiences & stories</h1>
          <p className="text-slate-400 text-xs mt-1">Connect with global travelers, discover itinerary spots, and bookmark trips</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold rounded-2xl text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" /> Share Your Story
        </button>
      </div>

      {/* Quick Post Prompt Box */}
      <div
        onClick={() => setShowCreateModal(true)}
        className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm cursor-pointer hover:border-emerald-400 transition-all flex items-center gap-4"
      >
        <img
          src={currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
          alt="Avatar"
          className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/20"
        />
        <div className="flex-1 bg-slate-100 rounded-2xl px-5 py-3 text-slate-500 text-xs font-medium">
          Share your travel story, hidden spots or ask travel questions...
        </div>
        <div className="hidden sm:flex items-center gap-2 text-slate-500 font-bold text-xs bg-slate-100 px-4 py-3 rounded-2xl">
          <ImageIcon className="w-4 h-4 text-emerald-600" /> Photos
        </div>
      </div>

      {/* Search & Category Filter Pills */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search posts by destination (e.g. Manali, Goa, Kerala)..."
            className="w-full bg-white border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-emerald-400 shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Social Feed Posts */}
      {loading ? (
        <Loader message="Loading social feed..." />
      ) : filteredPosts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <Sparkles className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-extrabold text-slate-800 text-base">No community posts found</h3>
          <p className="text-xs text-slate-500">Be the first solo traveler to share a story or search for another destination.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredPosts.map((post) => {
            const isLiked = post.likes?.some((l) => (l._id || l) === currentUser?._id);
            const isSaved = post.savedBy?.some((s) => (s._id || s) === currentUser?._id);

            return (
              <div key={post._id} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
                {/* Author Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={post.author?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
                      alt={post.author?.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/20"
                    />
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm">{post.author?.name || 'Traveler'}</h3>
                      <div className="text-[10px] text-slate-400 font-semibold flex items-center gap-2">
                        <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                          <MapPin className="w-3 h-3" /> {post.destination}
                        </span>
                        <span>• {new Date(post.createdAt || Date.now()).toLocaleDateString('en-IN')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {post.tags?.map((t, i) => (
                      <span key={i} className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Post Content */}
                <p className="text-slate-800 text-xs sm:text-sm leading-relaxed font-medium whitespace-pre-line">{post.content}</p>

                {/* Multi-Image Gallery */}
                {post.images && post.images.length > 0 && (
                  <div
                    className={`grid gap-2 rounded-2xl overflow-hidden border border-slate-100 ${
                      post.images.length === 1
                        ? 'grid-cols-1'
                        : post.images.length === 2
                        ? 'grid-cols-2'
                        : 'grid-cols-2 sm:grid-cols-3'
                    }`}
                  >
                    {post.images.map((img, idx) => (
                      <div key={idx} className="h-48 bg-slate-100 overflow-hidden">
                        <img src={img} alt={`Travel photo ${idx}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions & Counts */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-semibold text-slate-600">
                  <div className="flex items-center gap-6">
                    <button
                      onClick={() => handleLike(post._id)}
                      className={`flex items-center gap-1.5 transition-colors ${
                        isLiked ? 'text-rose-600 font-bold' : 'hover:text-rose-600'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-600 text-rose-600' : ''}`} />
                      <span>{post.likes?.length || 0} Likes</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-slate-400" />
                      <span>{post.comments?.length || 0} Comments</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleSavePost(post._id)}
                      className={`flex items-center gap-1 transition-colors ${
                        isSaved ? 'text-emerald-600 font-bold' : 'hover:text-emerald-600'
                      }`}
                    >
                      <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-emerald-600 text-emerald-600' : ''}`} />
                      <span>{isSaved ? 'Saved' : 'Save'}</span>
                    </button>

                    <button onClick={() => handleShare(post)} className="hover:text-slate-900 transition-colors">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Comments Thread */}
                {post.comments && post.comments.length > 0 && (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2.5">
                    {post.comments.map((c, idx) => (
                      <div key={c._id || idx} className="flex items-start gap-2 text-xs">
                        <img
                          src={c.user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
                          alt="avatar"
                          className="w-5 h-5 rounded-full object-cover mt-0.5"
                        />
                        <div>
                          <span className="font-extrabold text-slate-900 mr-1.5">{c.user?.name || 'Traveler'}:</span>
                          <span className="text-slate-700">{c.text}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Comment Input */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={commentTextMap[post._id] || ''}
                    onChange={(e) => setCommentTextMap({ ...commentTextMap, [post._id]: e.target.value })}
                    placeholder="Write a comment..."
                    onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post._id)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    onClick={() => handleAddComment(post._id)}
                    disabled={!commentTextMap[post._id]?.trim()}
                    className="px-4 py-2.5 bg-slate-900 hover:bg-emerald-600 text-white font-extrabold rounded-xl text-xs transition-all disabled:opacity-40"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE POST MODAL WITH MULTI-IMAGE PREVIEW */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl max-w-lg w-full space-y-5 text-white shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black">Share Your Travel Story</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Destination</label>
                <input
                  type="text"
                  required
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Manali, Goa, Kerala"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Travel Experience / Story</label>
                <textarea
                  rows={4}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Amazing sunrise at Manali! 🌄 Tell solo travelers about your experience..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Multi-image Uploader */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-400">Photos (Max 5 images)</label>
                  <span className="text-[10px] text-emerald-400 font-bold">{imageFiles.length}/5 Selected</span>
                </div>

                <label className="w-full py-3 bg-slate-950 border border-dashed border-slate-700 hover:border-emerald-500 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors text-xs text-slate-300 font-bold">
                  <ImageIcon className="w-4 h-4 text-emerald-400" />
                  {uploading ? 'Uploading to Cloudinary...' : '📷 Add Photos (Up to 5)'}
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleMultipleImagesUpload}
                    className="hidden"
                    disabled={uploading || imageFiles.length >= 5}
                  />
                </label>

                {/* Previews grid */}
                {imageFiles.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {imageFiles.map((preview, idx) => (
                      <div key={idx} className="relative rounded-xl overflow-hidden h-24 border border-slate-800 group">
                        <img src={preview} alt="preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 p-1 bg-slate-950/80 text-rose-400 rounded-full text-xs hover:bg-rose-600 hover:text-white transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="w-full py-2.5 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !content.trim()}
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold rounded-xl text-xs disabled:opacity-40"
                >
                  Post Story
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
