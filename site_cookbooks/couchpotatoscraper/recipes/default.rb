#
# Cookbook Name:: couchpotatoscraper
# Recipe:: default
#
# Copyright (C) 2014 YOUR_NAME
#
# All rights reserved - Do Not Redistribute
#

execute 'npm install' do
	cwd '/opt/app'
	command 'npm install'
end
