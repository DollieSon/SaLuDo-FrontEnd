<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Table Hover Effect</title>
<style>
  table {
    width: 60%;
    border-collapse: collapse;
    margin: 20px auto;
  }

  th, td {
    padding: 12px;
    border: 1px solid #ddd;
    text-align: left;
  }

  tbody tr {
    position: relative; /* anchor the ::before inside each row */
  }

  tbody tr::before {
    content: ""; /* required for pseudo-element */
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: linear-gradient(180deg, #e30022, #ff6b35);
    transform: scaleY(0);
    transform-origin: top;
    transition: transform 0.3s ease;
    pointer-events: none; /* won't block clicks */
  }

  tbody tr:hover::before {
    transform: scaleY(1);
  }
</style>
</head>
<body>

<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Role</th>
      <th>Department</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Ana</td>
      <td>Developer</td>
      <td>IT</td>
    </tr>
    <tr>
      <td>Marco</td>
      <td>Designer</td>
      <td>Creative</td>
    </tr>
    <tr>
      <td>Sophia</td>
      <td>Manager</td>
      <td>Operations</td>
    </tr>
  </tbody>
</table>

</body>
</html>
