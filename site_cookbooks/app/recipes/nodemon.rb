include_recipe "nodejs"

nodejs_npm "nodemon" do
	package "nodemon"
	options ['-g','--no-bin-links']
end