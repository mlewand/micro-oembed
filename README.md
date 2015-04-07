
# micro-oembed

Little NodeJS app that will produce some oEmbed responses. I created it at some point for testing purposes of the [embedbase](ckeditor.com/addon/embedbase) plugin.

Its main goal was simply to provide some real oEmbed responses for some websites, so I've decided to implement:

* [CKEditor Add-ons repository](http://ckeditor.com/addons/plugins/all)
* [CKEditor Trac](http://dev.ckeditor.com)

## Remark

It's not supposed to be a real oEmbed host, as I wanted consumer to provide some sort of abbreviation for certian resources. E.g. `#10925` instead of full URL `http://dev.ckeditor.com/ticket/10925`. So technically this violates oEmbed spec.

## Installation

Just do the following:

```
git clone git@github.com:mlewand/micro-oembed.git micro-oembed
cd micro-oembed
npm install
node ./main.js
```

By default host will start listening at port `9090`.