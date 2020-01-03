<%@page import="java.nio.charset.Charset"%>
<%@page import="java.util.stream.Collectors"%>
<%@page import="java.net.InetAddress"%>
<%@page import="java.util.Map"%>

<html>
<head>
<title>EMS system environment info</title>
<style type="text/css">
body {
	font-family: Arial;
	font-size: 11pt;
}

th{
	text-align:left;
}

table {
	border-collapse: collapse;
}

th,td{
	border: 1px solid #888;
	padding-left: 1em;
	padding-right: 1em;
}

tr:nth-child(2n) {
	background-color: #EFEFEF;
}

</style>
</head>
<body>
<h1>EMS system environment information</h1>
<h2>
	General information
</h2>
<table>
	<tr><th>IP address</th><td><%= InetAddress.getLocalHost().getHostAddress() %></td></tr>
	<tr><th>Host name</th><td><%= InetAddress.getLocalHost().getHostName() %></td></tr>
	<tr><th>Encoding</th><td><%= Charset.defaultCharset() %></td></tr>
	<tr><th>Version</th><td><%=Runtime.version()%></td></tr>
	<tr><th>Available processors</th><td><%= Runtime.getRuntime().availableProcessors()%></td></tr>
	<tr><th>Free Memory (MB)</th><td><%=Runtime.getRuntime().freeMemory()/1024/1024 %></td></tr>
	<tr><th>Total Memory (MB)</th><td><%=Runtime.getRuntime().totalMemory()/1024/1024 %></td></tr>
	<tr><th>Max Memory (MB)</th><td><%=Runtime.getRuntime().maxMemory()/1024/1024 %></td></tr>
</table>

<h2>JVM system properties</h2>

<table>
<% for(Map.Entry<Object,Object> property : System.getProperties().entrySet().stream().sorted((a,b)->a.getKey().toString().compareTo(b.getKey().toString())).collect(Collectors.toList())){%>
<tr><th><%= property.getKey()%></th><td><%=property.getValue()%></td></tr><% 	
}
%>
</table>

<h2>JVM environment properties</h2>

<table>
<% for(Map.Entry<String,String> property : System.getenv().entrySet().stream().sorted((a,b)->a.getKey().compareTo(b.getKey())).collect(Collectors.toList())){%>
<tr><th><%= property.getKey()%></th><td><%=property.getValue()%></td></tr><% 	
}
%>
</table>
</body>
</html>