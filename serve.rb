require 'webrick'
root = File.expand_path(File.dirname(__FILE__))
server = WEBrick::HTTPServer.new(:Port => 9123, :DocumentRoot => root)
trap('INT') { server.shutdown }
server.start
