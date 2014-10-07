include_recipe "nodejs"

node.couchpotatoscraper.nodejs.npm_packages.each do |pkg|
	nodejs_npm pkg
end