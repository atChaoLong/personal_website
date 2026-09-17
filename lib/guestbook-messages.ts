export const enGuestbook = {
  label: "GUEST SIGNALS / 06", title: "Leave a little light.", subtitle: "Every passing meteor is a message. Longer thoughts leave longer trails.",
  write: "Send a meteor", browse: "Read messages", pause: "Pause meteor shower", play: "Resume meteor shower", hint: "HOVER TO CATCH · TAP TO KEEP", count: "messages in orbit",
  empty: "A sky full of stars. Still waiting for your meteor.", loading: "Listening for signals…", loadError: "The sky is taking a moment. Try again.", retry: "Try again", visitor: "A passing traveler", close: "Close", caught: "SIGNAL CAUGHT", release: "Release meteor",
  formTitle: "A thought. A hello. A little light.", formDescription: "Your message will appear publicly. No email or account needed.", name: "Name (optional)", namePlaceholder: "What should we call you?", message: "Your message", messagePlaceholder: "What brought you here? Leave a thought for the next traveler…", submit: "Launch this meteor", sending: "Launching…", success: "Your meteor is in the sky.", listTitle: "Messages passing through", more: "Read older messages", loadingMore: "Loading…", noMessages: "No messages yet. Be the first to leave a light.",
  errors: { invalid: "Use up to 24 characters for your name and 280 for your message.", too_large: "This message is too long. Please keep it within 280 characters.", origin: "Please refresh this page before sending your message.", rate_limit: "A little pause between meteors. Try again in {seconds} seconds.", conflict: "Please edit your message before sending it again.", unavailable: "The message could not be confirmed. Your text is saved here; please try again." },
};
export const zhGuestbook: typeof enGuestbook = {
  label: "06 / 来访的光", title: "留下一道，属于你的光。", subtitle: "每颗流星，都是一条留言。想说的话越多，留下的星尾越长。",
  write: "发射一颗流星", browse: "浏览留言", pause: "暂停流星雨", play: "继续流星雨", hint: "悬停捕捉 · 点击停留", count: "条留言正在星空中",
  empty: "漫天星光，正等你的一颗流星。", loading: "正在接收星光…", loadError: "星空暂时没有回应，请再试一次。", retry: "重新接收", visitor: "无名旅人", close: "关闭", caught: "捕捉到一束光", release: "放飞这颗流星",
  formTitle: "一个想法，一声问候，一点光。", formDescription: "留言会公开展示，无需邮箱或登录。", name: "怎么称呼你（选填）", namePlaceholder: "留下名字，也可以匿名", message: "想说的话", messagePlaceholder: "是什么把你带到这里？为下一位路过的人留下一点想法…", submit: "让它成为流星", sending: "正在发射…", success: "你的流星，已加入这片星空。", listTitle: "那些路过这里的声音", more: "看看更早的留言", loadingMore: "正在加载…", noMessages: "还没有留言，来留下第一道光吧。",
  errors: { invalid: "昵称最多 24 个字，留言请填写 1–280 个字。", too_large: "这段留言太长了，请控制在 280 个字以内。", origin: "请刷新当前页面，再发送留言。", rate_limit: "让流星稍稍拉开距离，请在 {seconds} 秒后再试。", conflict: "请修改一下留言内容，然后重新发送。", unavailable: "暂时无法确认留言是否送达。文字已经为你保留，请再试一次。" },
};
