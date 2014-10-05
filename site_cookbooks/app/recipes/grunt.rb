include_recipe "nodejs"

nodejs_npm "grunt-cli" do
	package "grunt-cli"
	options ['-g','--no-bin-links']
end