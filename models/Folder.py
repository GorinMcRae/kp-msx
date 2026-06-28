from util import msx


class Folder:

    def __init__(self, data):
        self.id = data.get('id')
        self.title = data.get('title')

    def to_msx(self):
        return {
            "type": "default",
            "label": self.title,
            "action": msx.format_action('/msx/folder', params={'folder': self.id, 'page': '1'}, module='content')
            #"action": f"content:request:interaction:{config.MSX_HOST}/msx/folder?id={{ID}}&folder={self.id}&page={{PAGE}}@{config.MSX_HOST}/paging.html"
        }
