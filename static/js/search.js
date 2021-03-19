function searchClaim() {
  var input, filter, table, tr, td, i, txtValue;
  input = document.getElementById("input-for-claim");
  filter = input.value.toUpperCase();
  table = document.getElementById("list-claim");
  tr = table.getElementsByTagName("li");
  for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("div")[0].getElementsByTagName("span")[1];
    if (td) {
      txtValue = td.textContent || td.innerText;
      console.log(txtValue);
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        tr[i].style.display = "grid";
      } else {
        tr[i].style.display = "none";
      }
    }       
  }
};

function toggleSearch(){
    $("#input-for-claim").toggle(500);
}