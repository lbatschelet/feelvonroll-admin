/**
 * App state factory with default values.
 * Exports: createInitialState.
 */
export function createInitialState() {
  return {
    token: localStorage.getItem('admin_jwt') || '',
    page: 'dashboard',
    pins: [],
    error: '',
    query: '',
    filter: 'all',
    sort: 'newest',
    pageIndex: 1,
    pageSize: 25,
    loggedIn: false,
    bootstrapRequired: false,
    bootstrapMode: false,
    languages: [],
    questions: [],
    options: [],
    translations: {},
    translationsByLang: {},
    pendingTranslationsByLang: {},
    selectedLanguage: 'de',
    draggingKey: null,
    users: [],
    audit: {
      items: [],
      total: 0,
      limit: 50,
      offset: 0,
    },
    refreshTimer: null,
    lastResetLink: '',
    editingUserId: null,
    currentUserId: null,
    currentUser: null,
    isAdmin: false,
  }
}
