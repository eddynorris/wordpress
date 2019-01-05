<script type="text/javascript">
  var containers = document.getElementsByClassName("insert_map_iframe_container");
  var url_rand = Math.floor((Math.random()*10)+1);
  var base_img_url = "http://cdn.geopowered.com/Applications/WordPressPlugins/AGOL/Free/logos/";
  var target_img = "service-logo-"+url_rand+".png";
  for (var i = 0; i < containers.length; i++) {
    var thisContainer = containers[i];
    thisContainer.innerHTML = thisContainer.innerHTML + "<div><img src='" + base_img_url + target_img + "' /></div>";
  }
</script>