import type { MyUserInfo} from 'lemmy-js-client'

export const isAdmin = (me: MyUserInfo) => me.local_user_view.person.admin

